import React, { useState } from 'react'
import { MapPin, X } from 'lucide-react'
import { detectUserLocation } from '../services/locationService'
import { userProfileService } from '../services/supabaseService'

interface LocationUpdatePromptProps {
  onLocationUpdated?: () => void
  onDismiss?: () => void
}

const LocationUpdatePrompt: React.FC<LocationUpdatePromptProps> = ({
  onLocationUpdated,
  onDismiss
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleAutoDetectLocation = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const location = await detectUserLocation()
      
      if (location) {
        // Update user profile with detected location
        await userProfileService.updateProfile({
          city: location.city,
          state: location.state,
          latitude: location.latitude,
          longitude: location.longitude,
          location_address: `${location.city}, ${location.state}, ${location.country}`
        })

        setSuccess(`Location updated to ${location.city}, ${location.state}`)
        setTimeout(() => {
          onLocationUpdated?.()
        }, 2000)
      } else {
        setError('Could not detect your location. Please try again or set it manually.')
      }
    } catch (err) {
      console.error('Error updating location:', err)
      setError('Failed to update location. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = () => {
    onDismiss?.()
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-800">
              Location Required
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              Your location is needed to show you nearby volunteer opportunities. 
              We can detect it automatically or you can set it manually.
            </p>
            
            {error && (
              <p className="text-sm text-red-600 mt-2">{error}</p>
            )}
            
            {success && (
              <p className="text-sm text-green-600 mt-2">{success}</p>
            )}
            
            <div className="mt-3 flex space-x-3">
              <button
                onClick={handleAutoDetectLocation}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Detecting...' : 'Auto-detect Location'}
              </button>
              
              <button
                onClick={handleDismiss}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Set Later
              </button>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 ml-4"
        >
          <X className="w-4 h-4 text-blue-400 hover:text-blue-600" />
        </button>
      </div>
    </div>
  )
}

export default LocationUpdatePrompt
