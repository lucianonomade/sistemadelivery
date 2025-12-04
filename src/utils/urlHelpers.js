// Get the app URL from environment or use default
export const getAppUrl = () => {
    return import.meta.env.VITE_APP_URL || window.location.origin
}

// Generate tracking link
export const getTrackingLink = (trackingCode) => {
    const baseUrl = getAppUrl()
    return `${baseUrl}/rastrear/${trackingCode}`
}

// Copy tracking link to clipboard
export const copyTrackingLink = async (trackingCode) => {
    const link = getTrackingLink(trackingCode)
    try {
        await navigator.clipboard.writeText(link)
        return { success: true }
    } catch (error) {
        return { success: false, error: error.message }
    }
}
