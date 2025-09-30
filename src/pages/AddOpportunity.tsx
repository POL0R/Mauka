import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Calendar, Users, Clock, Tag } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const AddOpportunity: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [mapLoaded, setMapLoaded] = useState(false)
  const [map, setMap] = useState<any>(null)
  const [geocoder, setGeocoder] = useState<any>(null)
  const mapContainer = useRef<HTMLDivElement>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    category: '',
    skillsRequired: [] as string[],
    locationAddress: '',
    city: '',
    state: '',
    pincode: '',
    latitude: 0,
    longitude: 0,
    duration: '',
    startDate: '',
    endDate: '',
    maxVolunteers: '',
    isVirtual: false
  })

  const categoryOptions = [
    'Education',
    'Healthcare',
    'Environment',
    'Community Development',
    'Animal Welfare',
    'Disaster Relief',
    'Technology',
    'Arts & Culture',
    'Sports',
    'Other'
  ]

  const skillOptions = [
    'Teaching',
    'Mentoring',
    'Event Management',
    'Social Media',
    'Photography',
    'Writing',
    'Translation',
    'Data Entry',
    'Fundraising',
    'Public Speaking',
    'Technical Skills',
    'Administrative',
    'Creative Design',
    'Research',
    'Other'
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skillsRequired: prev.skillsRequired.includes(skill)
        ? prev.skillsRequired.filter(s => s !== skill)
        : [...prev.skillsRequired, skill]
    }))
  }

  // Initialize Mapbox with Geocoder
  useEffect(() => {
    const initMapWithGeocoder = async () => {
      if (!mapContainer.current || mapLoaded) return

      try {
        // Dynamically import mapbox-gl and geocoder
        const mapboxgl = (await import('mapbox-gl')).default
        const MapboxGeocoder = (await import('@mapbox/mapbox-gl-geocoder')).default
        
        // Set access token
        mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoibWF1a2FwbGF0Zm9ybSIsImEiOiJjbHZ6cGJ6Z2owMDF0MmpwZ2V6Z2V6Z2V6In0.example'

        // Create map
        const mapInstance = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [72.8777, 19.0760], // Mumbai coordinates
          zoom: 10
        })

        // Add navigation controls
        mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right')

        // Create geocoder
        const geocoderInstance = new MapboxGeocoder({
          accessToken: mapboxgl.accessToken,
          mapboxgl: mapboxgl,
          marker: true, // Show marker on selected location
          placeholder: 'Search for a location in India...',
          countries: 'in', // Limit to India
          types: 'place,locality,neighborhood,address,poi',
          bbox: [68.1, 6.5, 97.4, 37.1], // India bounding box
          proximity: [72.8777, 19.0760], // Bias towards Mumbai
          language: 'en'
        })

        // Add geocoder to the map
        mapInstance.addControl(geocoderInstance)

        // Handle geocoder result
        geocoderInstance.on('result', (e: any) => {
          const result = e.result
          const [lng, lat] = result.center
          const context = result.context || []
          
          // Extract address components
          let city = ''
          let state = ''
          let pincode = ''
          
          context.forEach((item: any) => {
            if (item.id.startsWith('place')) {
              city = item.text
            } else if (item.id.startsWith('region')) {
              state = item.text
            } else if (item.id.startsWith('postcode')) {
              pincode = item.text
            }
          })

          // Update form data with selected location
          setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            locationAddress: result.place_name || result.text || '',
            city: city || prev.city,
            state: state || prev.state,
            pincode: pincode || prev.pincode
          }))
        })

        // Handle geocoder clear
        geocoderInstance.on('clear', () => {
          setFormData(prev => ({
            ...prev,
            latitude: 0,
            longitude: 0,
            locationAddress: '',
            city: '',
            state: '',
            pincode: ''
          }))
        })

        setMap(mapInstance)
        setGeocoder(geocoderInstance)
        setMapLoaded(true)

      } catch (error) {
        console.error('Error initializing map with geocoder:', error)
      }
    }

    initMapWithGeocoder()

    // Cleanup function
    return () => {
      if (map) {
        map.remove()
      }
    }
  }, [mapLoaded])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.category) {
        throw new Error('Please fill in all required fields')
      }

      // Validate location for non-virtual opportunities
      if (!formData.isVirtual && (!formData.locationAddress || formData.latitude === 0 || formData.longitude === 0)) {
        throw new Error('Please select a location using the map search')
      }

      // Create the opportunity
      const { data, error } = await supabase
        .from('volunteer_opportunities')
        .insert({
          ngo_id: user.id,
          title: formData.title,
          description: formData.description,
          requirements: formData.requirements || null,
          category: formData.category,
          skills_required: formData.skillsRequired,
          location_address: formData.locationAddress,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode || null,
          latitude: formData.latitude || 0,
          longitude: formData.longitude || 0,
          duration: formData.duration || null,
          start_date: formData.startDate || null,
          end_date: formData.endDate || null,
          max_volunteers: formData.maxVolunteers ? parseInt(formData.maxVolunteers) : 1,
          is_virtual: formData.isVirtual,
          status: 'active'
        })
        .select()
        .single()

      if (error) throw error

      setSuccess('Volunteer opportunity created successfully!')
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)

    } catch (err: any) {
      console.error('Error creating opportunity:', err)
      setError(err.message || 'Failed to create opportunity. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-orange-600 hover:text-orange-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create Volunteer Opportunity</h1>
          <p className="text-gray-600 mt-2">Add a new volunteer opportunity for your NGO</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opportunity Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g., Teach English to Children"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Describe the volunteer opportunity in detail..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a category</option>
                  {categoryOptions.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g., 2-3 hours per week"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isVirtual"
                  checked={formData.isVirtual}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">
                  This is a virtual/online opportunity
                </label>
              </div>

              {!formData.isVirtual && (
                <div className="space-y-4">
                  {/* Mapbox Geocoder with Map */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Location *
                    </label>
                    <div className="relative">
                      <div 
                        ref={mapContainer}
                        className="w-full h-80 rounded-lg border border-gray-300"
                        style={{ minHeight: '320px' }}
                      />
                      {!mapLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
                            <p className="text-sm text-gray-600">Loading map...</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Use the search box on the map to find and select your location. The address fields will be automatically filled.
                    </p>
                  </div>

                  {/* Selected Location Display */}
                  {formData.locationAddress && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h4 className="font-medium text-orange-900 mb-2">Selected Location:</h4>
                      <p className="text-sm text-orange-800 mb-2">{formData.locationAddress}</p>
                      {(formData.latitude !== 0 || formData.longitude !== 0) && (
                        <p className="text-xs text-orange-600">
                          Coordinates: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Address Details (Read-only, auto-populated) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                        placeholder="Auto-filled from map selection"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                        placeholder="Auto-filled from map selection"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PIN Code
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                        placeholder="Auto-filled from map selection"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Skills & Requirements */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills & Requirements</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Skills
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {skillOptions.map(skill => (
                    <label key={skill} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.skillsRequired.includes(skill)}
                        onChange={() => handleSkillToggle(skill)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{skill}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Requirements
                </label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Any specific requirements, qualifications, or expectations..."
                />
              </div>
            </div>
          </div>

          {/* Schedule & Capacity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Schedule & Capacity</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Volunteers
                </label>
                <input
                  type="number"
                  name="maxVolunteers"
                  value={formData.maxVolunteers}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g., 10"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Opportunity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddOpportunity

