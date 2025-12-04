import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Card, { CardHeader, CardBody } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { db } from '../../services/supabase'
import { getStatusLabel, getStatusColor } from '../../services/deliveryService'
import { reverseGeocode } from '../../services/mapbox'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import './TrackDelivery.css'

export default function TrackDelivery() {
    const { trackingCode } = useParams()
    const [delivery, setDelivery] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [updateAddresses, setUpdateAddresses] = useState({})

    useEffect(() => {
        loadDelivery()
    }, [trackingCode])

    const loadDelivery = async () => {
        setLoading(true)
        const { data, error } = await db.getDeliveryByTrackingCode(trackingCode)

        if (error || !data) {
            setError('Entrega não encontrada')
            setLoading(false)
            return
        }

        setDelivery(data)

        // Reverse geocode tracking updates with coordinates
        if (data.tracking_updates && data.tracking_updates.length > 0) {
            const addresses = {}
            for (const update of data.tracking_updates) {
                if (update.latitude && update.longitude) {
                    const result = await reverseGeocode(update.latitude, update.longitude)
                    if (result.success) {
                        addresses[update.id] = result.address
                    }
                }
            }
            setUpdateAddresses(addresses)
        }

        setLoading(false)
    }

    if (loading) {
        return (
            <div className="track-page">
                <div className="track-container">
                    <LoadingSpinner size="lg" />
                </div>
            </div>
        )
    }

    if (error || !delivery) {
        return (
            <div className="track-page">
                <div className="track-container">
                    <Card>
                        <CardBody>
                            <div className="error-state">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 8v4M12 16h.01" />
                                </svg>
                                <h2>Entrega não encontrada</h2>
                                <p>O código de rastreamento informado não foi encontrado.</p>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="track-page">
            <div className="track-container">
                <div className="track-header">
                    <div className="track-logo">
                        <img src="/polimix-logo.png" alt="Polimix" className="logo-image" />
                    </div>
                    <p className="track-subtitle">Rastreamento de Entrega</p>
                </div>

                <Card className="track-card">
                    <CardHeader>
                        <div className="track-info-header">
                            <div>
                                <p className="track-code-label">Código de Rastreamento</p>
                                <p className="track-code">{delivery.tracking_code}</p>
                            </div>
                            <Badge variant={getStatusColor(delivery.status)} className="status-badge-large">
                                {getStatusLabel(delivery.status)}
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardBody>
                        <div className="track-details">
                            <div className="detail-section">
                                <h3>Informações da Entrega</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Cliente</span>
                                        <span className="detail-value">{delivery.customer?.name || '-'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Tipo de Cimento</span>
                                        <span className="detail-value">{delivery.cement_type || '-'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Quantidade</span>
                                        <span className="detail-value">{delivery.quantity || '-'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Data de Criação</span>
                                        <span className="detail-value">
                                            {format(new Date(delivery.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h3>Endereço de Entrega</h3>
                                <p className="address-text">{delivery.destination_address}</p>
                            </div>

                            {delivery.driver_name && (
                                <div className="detail-section">
                                    <h3>Informações do Motorista</h3>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <span className="detail-label">Nome</span>
                                            <span className="detail-value">{delivery.driver_name}</span>
                                        </div>
                                        {delivery.driver_phone && (
                                            <div className="detail-item">
                                                <span className="detail-label">Telefone</span>
                                                <span className="detail-value">{delivery.driver_phone}</span>
                                            </div>
                                        )}
                                        {delivery.vehicle_plate && (
                                            <div className="detail-item">
                                                <span className="detail-label">Placa do Veículo</span>
                                                <span className="detail-value">{delivery.vehicle_plate}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {delivery.tracking_updates && delivery.tracking_updates.length > 0 && (
                                <div className="detail-section">
                                    <h3>Histórico de Atualizações</h3>
                                    <div className="timeline">
                                        {delivery.tracking_updates.map((update, index) => (
                                            <div key={update.id} className="timeline-item">
                                                <div className="timeline-marker"></div>
                                                <div className="timeline-content">
                                                    <p className="timeline-status">
                                                        <Badge variant={getStatusColor(update.status)}>
                                                            {getStatusLabel(update.status)}
                                                        </Badge>
                                                    </p>
                                                    {update.notes && <p className="timeline-notes">{update.notes}</p>}
                                                    {update.latitude && update.longitude && (
                                                        <p className="timeline-location">
                                                            📍 {updateAddresses[update.id] || `${update.latitude.toFixed(6)}, ${update.longitude.toFixed(6)}`}
                                                        </p>
                                                    )}
                                                    <p className="timeline-date">
                                                        {format(new Date(update.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    )
}
