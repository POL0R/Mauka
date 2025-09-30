import { getDefaultLocation } from './simpleLocationService'

// IP-based location detection service
export const getLocationFromIP = async (): Promise<{
  city: string
  state: string
  country: string
  latitude: number
  longitude: number
} | null> => {
  try {
    // Using ipapi.co for IP geolocation (free tier: 1000 requests/day)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
    
    const response = await fetch('https://ipapi.co/json/', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      }
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch location`)
    }

    const data = await response.json()
    
    if (data.error) {
      throw new Error(data.reason || 'Location detection failed')
    }

    return {
      city: data.city || '',
      state: data.region || '',
      country: data.country_name || '',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0
    }
  } catch (error) {
    console.error('Error detecting location from IP:', error)
    return null // Return null instead of fallback, let the calling function handle it
  }
}

// Alternative service using ip-api.com (free tier: 1000 requests/month)
export const getLocationFromIPAlternative = async (): Promise<{
  city: string
  state: string
  country: string
  latitude: number
  longitude: number
} | null> => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
    
    const response = await fetch('http://ip-api.com/json/', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      }
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch location`)
    }

    const data = await response.json()
    
    if (data.status === 'fail') {
      throw new Error(data.message || 'Location detection failed')
    }

    return {
      city: data.city || '',
      state: data.regionName || '',
      country: data.country || '',
      latitude: data.lat || 0,
      longitude: data.lon || 0
    }
  } catch (error) {
    console.error('Error detecting location from IP (alternative):', error)
    return null
  }
}

// Browser geolocation service (asks for permission)
export const getLocationFromBrowser = async (): Promise<{
  city: string
  state: string
  country: string
  latitude: number
  longitude: number
} | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser')
      resolve(null)
      return
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          
          // Use reverse geocoding to get city and state
          // For now, we'll use a simple approach with coordinates
          // In a real app, you'd use a geocoding service like Google Maps or Mapbox
          const location = await reverseGeocode(latitude, longitude)
          
          if (location) {
            resolve({
              city: location.city,
              state: location.state,
              country: location.country,
              latitude,
              longitude
            })
          } else {
            resolve(null)
          }
        } catch (error) {
          console.error('Error in reverse geocoding:', error)
          resolve(null)
        }
      },
      (error) => {
        console.warn('Geolocation error:', error.message)
        resolve(null)
      },
      options
    )
  })
}

// Simple reverse geocoding using a free service
const reverseGeocode = async (lat: number, lng: number): Promise<{
  city: string
  state: string
  country: string
} | null> => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      }
    )
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    
    return {
      city: data.city || data.locality || '',
      state: data.principalSubdivision || data.administrativeArea || '',
      country: data.countryName || ''
    }
  } catch (error) {
    console.error('Reverse geocoding failed:', error)
    return null
  }
}

// Main function that tries browser location first, then IP services
export const detectUserLocation = async (): Promise<{
  city: string
  state: string
  country: string
  latitude: number
  longitude: number
} | null> => {
  // First try browser geolocation (asks for permission)
  let location = await getLocationFromBrowser()
  
  if (location) {
    return location
  }
  
  // If browser geolocation fails, try IP-based services
  location = await getLocationFromIP()
  
  // If primary IP service fails, try alternative
  if (!location) {
    location = await getLocationFromIPAlternative()
  }
  
  // If all services fail, return a default location
  if (!location) {
    console.warn('All location services failed, using default location')
    return getDefaultLocation()
  }
  
  return location
}
