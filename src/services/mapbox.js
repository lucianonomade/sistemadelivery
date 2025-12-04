import mapboxgl from 'mapbox-gl'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

if (!MAPBOX_TOKEN) {
  console.error('Missing Mapbox token. Please check your .env file.')
}

mapboxgl.accessToken = MAPBOX_TOKEN

export { mapboxgl }

// Geocoding - Convert address to coordinates
export const geocodeAddress = async (address) => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}&country=BR&language=pt`
    )
    const data = await response.json()

    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center
      return {
        lat,
        lng,
        fullAddress: data.features[0].place_name,
        success: true
      }
    }

    return { success: false, error: 'Endereço não encontrado' }
  } catch (error) {
    console.error('Geocoding error:', error)
    return { success: false, error: error.message }
  }
}

// Reverse Geocoding - Convert coordinates to address
export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=pt`
    )
    const data = await response.json()

    if (data.features && data.features.length > 0) {
      return {
        address: data.features[0].place_name,
        success: true
      }
    }

    return { success: false, error: 'Endereço não encontrado' }
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return { success: false, error: error.message }
  }
}

// Get route between two points
export const getRoute = async (startLng, startLat, endLng, endLat) => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${startLng},${startLat};${endLng},${endLat}?geometries=geojson&access_token=${MAPBOX_TOKEN}&language=pt`
    )
    const data = await response.json()

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0]
      return {
        geometry: route.geometry,
        distance: route.distance, // in meters
        duration: route.duration, // in seconds
        success: true
      }
    }

    return { success: false, error: 'Rota não encontrada' }
  } catch (error) {
    console.error('Route error:', error)
    return { success: false, error: error.message }
  }
}

// Calculate distance between two points (Haversine formula)
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return distance // in km
}

const toRad = (degrees) => {
  return degrees * (Math.PI / 180)
}

// Calculate ETA based on distance and average speed
export const calculateETA = (distanceKm, averageSpeedKmh = 50) => {
  const hours = distanceKm / averageSpeedKmh
  const minutes = Math.round(hours * 60)
  return minutes
}

// Format distance for display
export const formatDistance = (distanceKm) => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`
  }
  return `${distanceKm.toFixed(1)} km`
}

// Format duration for display
export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}min`
}

// Create a custom marker element
export const createCustomMarker = (type = 'truck') => {
  const el = document.createElement('div')
  el.className = `custom-marker marker-${type}`

  if (type === 'truck') {
    el.innerHTML = `
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" fill="#2563eb" stroke="white" stroke-width="3"/>
        <path d="M12 18h8v-4h-8v4zm0 2v4h2c0 1.1.9 2 2 2s2-.9 2-2h4c0 1.1.9 2 2 2s2-.9 2-2h2v-4h-14zm14-6h3l3 3v3h-6v-6z" fill="white"/>
      </svg>
    `
  } else if (type === 'destination') {
    el.innerHTML = `
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 4c-5.5 0-10 4.5-10 10 0 7.5 10 22 10 22s10-14.5 10-22c0-5.5-4.5-10-10-10zm0 13.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z" fill="#f97316" stroke="white" stroke-width="2"/>
      </svg>
    `
  }

  return el
}

// Initialize map with default options
export const initializeMap = (container, options = {}) => {
  const defaultOptions = {
    container,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [-46.6333, -23.5505], // São Paulo, Brazil
    zoom: 12,
    ...options
  }

  return new mapboxgl.Map(defaultOptions)
}
