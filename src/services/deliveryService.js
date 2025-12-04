import { nanoid } from 'nanoid'
import { db, auth } from './supabase'
import { calculateDistance, calculateETA } from './mapbox'

// Generate unique tracking code
export const generateTrackingCode = () => {
    return nanoid(10).toUpperCase()
}

// Create a new delivery
export const createDelivery = async (deliveryData) => {
    try {
        const { user } = await auth.getUser()
        if (!user) {
            return { success: false, error: 'Usuário não autenticado' }
        }

        const trackingCode = generateTrackingCode()

        const delivery = {
            tracking_code: trackingCode,
            customer_id: deliveryData.customer_id,
            created_by: user.id,
            status: 'pending',
            cement_type: deliveryData.cement_type,
            quantity: deliveryData.quantity,
            origin_address: deliveryData.origin_address,
            destination_address: deliveryData.destination_address,
            destination_lat: deliveryData.destination_lat,
            destination_lng: deliveryData.destination_lng,
            driver_name: deliveryData.driver_name || null,
            driver_phone: deliveryData.driver_phone || null,
            vehicle_plate: deliveryData.vehicle_plate || null,
            notes: deliveryData.notes || null,
            estimated_arrival: deliveryData.estimated_arrival || null,
        }

        const { data, error } = await db.createDelivery(delivery)

        if (error) {
            return { success: false, error: error.message }
        }

        return { success: true, data }
    } catch (error) {
        return { success: false, error: error.message }
    }
}

// Update delivery status
export const updateDeliveryStatus = async (deliveryId, status, notes = null) => {
    try {
        const updates = {
            status,
            updated_at: new Date().toISOString()
        }

        if (status === 'delivered') {
            updates.actual_arrival = new Date().toISOString()
        }

        const { data, error } = await db.updateDelivery(deliveryId, updates)

        if (error) {
            return { success: false, error: error.message }
        }

        // Add tracking update
        if (notes || status) {
            await addTrackingUpdate(deliveryId, {
                status,
                notes,
                latitude: null,
                longitude: null
            })
        }

        return { success: true, data }
    } catch (error) {
        return { success: false, error: error.message }
    }
}

// Add tracking update with location
export const addTrackingUpdate = async (deliveryId, updateData) => {
    try {
        const { user } = await auth.getUser()

        const update = {
            delivery_id: deliveryId,
            latitude: updateData.latitude,
            longitude: updateData.longitude,
            status: updateData.status,
            notes: updateData.notes || null,
            created_by: user?.id || null
        }

        const { data, error } = await db.addTrackingUpdate(update)

        if (error) {
            return { success: false, error: error.message }
        }

        // Update delivery with latest location if provided
        if (updateData.latitude && updateData.longitude) {
            await db.updateDelivery(deliveryId, {
                updated_at: new Date().toISOString()
            })
        }

        return { success: true, data }
    } catch (error) {
        return { success: false, error: error.message }
    }
}

// Calculate ETA for delivery
export const calculateDeliveryETA = (currentLat, currentLng, destLat, destLng) => {
    const distance = calculateDistance(currentLat, currentLng, destLat, destLng)
    const etaMinutes = calculateETA(distance)

    const now = new Date()
    const eta = new Date(now.getTime() + etaMinutes * 60000)

    return {
        distance,
        etaMinutes,
        etaTime: eta
    }
}

// Get delivery status label
export const getStatusLabel = (status) => {
    const labels = {
        pending: 'Pendente',
        in_transit: 'Em Trânsito',
        delivered: 'Entregue',
        cancelled: 'Cancelado'
    }
    return labels[status] || status
}

// Get status color
export const getStatusColor = (status) => {
    const colors = {
        pending: 'warning',
        in_transit: 'primary',
        delivered: 'success',
        cancelled: 'danger'
    }
    return colors[status] || 'neutral'
}

// Format tracking link
export const getTrackingLink = (trackingCode) => {
    const baseUrl = window.location.origin
    return `${baseUrl}/rastrear/${trackingCode}`
}

// Copy tracking link to clipboard
export const copyTrackingLink = async (trackingCode) => {
    const link = getTrackingLink(trackingCode)
    try {
        await navigator.clipboard.writeText(link)
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Falha ao copiar link' }
    }
}
