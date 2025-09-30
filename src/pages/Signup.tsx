import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, MapPin, Upload, X, Sparkles, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { detectUserLocation, getLocationFromBrowser } from '../services/locationService'
// import { getCommonIndianCities } from '../services/simpleLocationService'

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'volunteer',
    // Volunteer fields
    phone: '',
    bio: '',
    skills: [] as string[],
    interests: [] as string[],
    // Location fields (for both volunteers and NGOs)
    latitude: 0,
    longitude: 0,
    // NGO fields
    organizationName: '',
    registrationNumber: '',
    organizationEmail: '',
    organizationPhone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    description: '',
    focusAreas: [] as string[],
    establishedYear: '',
    teamSize: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [locationStatus, setLocationStatus] = useState('')
  const [mapLoaded, setMapLoaded] = useState(false)
  const [map, setMap] = useState<any>(null)
  const [geocoder, setGeocoder] = useState<any>(null)
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false)
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const mapContainerVolunteer = useRef<HTMLDivElement>(null)
  const mapContainerNGO = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const skillOptions = [
    'Teaching', 'Healthcare', 'Technology', 'Communication', 'Leadership',
    'Event Management', 'Fundraising', 'Social Media', 'Photography', 'Writing',
    'Translation', 'Legal', 'Accounting', 'Marketing', 'Design'
  ]

  const interestOptions = [
    'Education', 'Healthcare', 'Environment', 'Social Service', 'Disaster Relief',
    'Animal Welfare', 'Women Empowerment', 'Child Welfare', 'Elder Care', 'Skill Development',
    'Community Development', 'Human Rights', 'Arts & Culture', 'Sports', 'Technology'
  ]

  const focusAreaOptions = [
    'Education', 'Healthcare', 'Environment', 'Social Service', 'Disaster Relief',
    'Animal Welfare', 'Women Empowerment', 'Child Welfare', 'Elder Care', 'Skill Development'
  ]


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleArrayChange = (field: 'skills' | 'interests' | 'focusAreas', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
  }

  const autoDetectLocation = async () => {
    setDetectingLocation(true)
    setLocationStatus('Requesting location permission...')
    
    try {
      // First try browser geolocation
      const browserLocation = await getLocationFromBrowser()
      
      if (browserLocation) {
        setFormData(prev => ({
          ...prev,
          city: browserLocation.city,
          state: browserLocation.state,
        }))
        setLocationStatus(`✅ Location detected via GPS: ${browserLocation.city}, ${browserLocation.state}`)
      } else {
        // Fallback to IP detection
        setLocationStatus('Permission denied, trying IP-based detection...')
        const location = await detectUserLocation()
        
        if (location) {
          setFormData(prev => ({
            ...prev,
            city: location.city,
            state: location.state,
          }))
          setLocationStatus(`✅ Location detected via IP: ${location.city}, ${location.state}`)
        } else {
          setLocationStatus('❌ Location detection failed. Please enter manually.')
        }
      }
      
      // Clear status after 3 seconds
      setTimeout(() => setLocationStatus(''), 3000)
    } catch (error) {
      console.error('Failed to detect location:', error)
      setLocationStatus('❌ Location detection failed. Please enter manually.')
      setTimeout(() => setLocationStatus(''), 5000)
    } finally {
      setDetectingLocation(false)
    }
  }

  const handleCitySelect = (city: string, state: string) => {
    setFormData(prev => ({
      ...prev,
      city,
      state
    }))
    setShowCityDropdown(false)
  }

  // Get user's current location using browser geolocation
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.')
      return
    }

    setDetectingLocation(true)
    setLocationStatus('Requesting location permission...')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setLocationStatus('Location permission granted! Getting address...')
        
        try {
          // Reverse geocode to get address
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoibWF1a2FwbGF0Zm9ybSIsImEiOiJjbHZ6cGJ6Z2owMDF0MmpwZ2V6Z2V6Z2V6In0.example'}`
          )
          
          const data = await response.json()
          
          if (data.features && data.features.length > 0) {
            const feature = data.features[0]
            const context = feature.context || []
            
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

            // Update form data with current location
            setFormData(prev => ({
              ...prev,
              address: feature.place_name || feature.text || '',
              city: city || prev.city,
              state: state || prev.state,
              pincode: pincode || prev.pincode,
              latitude: latitude,
              longitude: longitude
            }))

            setLocationStatus('✅ Location detected successfully!')
            setLocationPermissionGranted(true)

            // Update map if it's loaded
            if (map) {
              map.flyTo({ center: [longitude, latitude], zoom: 15 })
              
              // Remove existing marker
              const existingMarkers = document.querySelectorAll('.mapboxgl-marker')
              existingMarkers.forEach(marker => marker.remove())

              // Add new marker
              const mapboxgl = (await import('mapbox-gl')).default
              new mapboxgl.Marker()
                .setLngLat([longitude, latitude])
                .addTo(map)
            }
          }
        } catch (error) {
          console.error('Error reverse geocoding:', error)
          setLocationStatus('❌ Could not get address from coordinates')
        } finally {
          setDetectingLocation(false)
        }
      },
      (error) => {
        setDetectingLocation(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationStatus('❌ Location permission denied. Please allow location access or use the map to select your location.')
            break
          case error.POSITION_UNAVAILABLE:
            setLocationStatus('❌ Location information unavailable. Please use the map to select your location.')
            break
          case error.TIMEOUT:
            setLocationStatus('❌ Location request timed out. Please use the map to select your location.')
            break
          default:
            setLocationStatus('❌ An unknown error occurred. Please use the map to select your location.')
            break
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  }

  // Reset map when user type changes
  useEffect(() => {
    setMapLoaded(false)
    setMap(null)
    setGeocoder(null)
    
    if (formData.userType === 'ngo' && !formData.city) {
      autoDetectLocation()
    }
  }, [formData.userType])

  // Initialize Mapbox with Geocoder for location selection
  useEffect(() => {
    let mapInstance: any = null
    let geocoderInstance: any = null

    const initMapWithGeocoder = async () => {
      // Determine which container to use based on user type
      const container = formData.userType === 'volunteer' ? mapContainerVolunteer.current : mapContainerNGO.current
      
      if (!container) return
      
      // Skip if already loaded
      if (mapLoaded && map) return

      try {
        // Dynamically import mapbox-gl and geocoder
        const mapboxgl = (await import('mapbox-gl')).default
        const MapboxGeocoder = (await import('@mapbox/mapbox-gl-geocoder')).default
        
        // Set access token
        mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoibWF1a2FwbGF0Zm9ybSIsImEiOiJjbHZ6cGJ6Z2owMDF0MmpwZ2V6Z2V6Z2V6In0.example'

        // Create map
        mapInstance = new mapboxgl.Map({
          container: container,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [72.8777, 19.0760], // Mumbai coordinates
          zoom: 10
        })

        // Add navigation controls
        mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right')

        // Create geocoder
        geocoderInstance = new MapboxGeocoder({
          accessToken: mapboxgl.accessToken,
          mapboxgl: mapboxgl,
          marker: true, // Show marker on selected location
          placeholder: 'Search for your location in India...',
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
            address: result.place_name || result.text || '',
            city: city || prev.city,
            state: state || prev.state,
            pincode: pincode || prev.pincode,
            latitude: lat,
            longitude: lng
          }))

          setLocationStatus('Location selected via map')
        })

        // Handle geocoder clear
        geocoderInstance.on('clear', () => {
          setFormData(prev => ({
            ...prev,
            address: '',
            city: '',
            state: '',
            pincode: '',
            latitude: 0,
            longitude: 0
          }))
          setLocationStatus('')
        })

        setMap(mapInstance)
        setGeocoder(geocoderInstance)
        setMapLoaded(true)

      } catch (error) {
        console.error('Error initializing map with geocoder:', error)
      }
    }

    // Initialize map for both volunteers and NGOs when user type is selected
    if ((formData.userType === 'ngo' || formData.userType === 'volunteer') && !mapLoaded) {
      initMapWithGeocoder()
    }

    // Cleanup function
    return () => {
      try {
        if (geocoderInstance) {
          geocoderInstance.off('result')
          geocoderInstance.off('clear')
        }
        if (mapInstance) {
          mapInstance.remove()
        }
      } catch (err) {
        console.error('Error cleaning up map:', err)
      }
    }
  }, [formData.userType, mapLoaded])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.city-dropdown-container')) {
        setShowCityDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }

      setProfilePicture(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeProfilePicture = () => {
    setProfilePicture(null)
    setProfilePicturePreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadProfilePicture = async (userId: string): Promise<string | null> => {
    if (!profilePicture) return null

    try {
      setUploadingImage(true)
      const fileExt = profilePicture.name.split('.').pop()
      const fileName = `${userId}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, profilePicture, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading profile picture:', error)
      return null
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    // Validate location for both volunteers and NGOs
    if (!formData.address || !formData.city || !formData.state) {
      setError('Please select your location using the map or geolocation button')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            user_type: formData.userType
          }
        }
      })

      if (error) throw error

      // If signup successful, wait a moment for auth to settle, then create profile
      if (data.user) {
        // Upload profile picture if selected
        let avatarUrl: string | null = null
        if (profilePicture) {
          avatarUrl = await uploadProfilePicture(data.user.id)
        }

        // Wait for auth state to settle
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        try {
          const profileData = {
            id: data.user.id,
            full_name: formData.fullName,
            user_type: formData.userType,
            phone: formData.phone,
            bio: formData.bio,
            skills: formData.skills,
            interests: formData.interests,
            location_address: formData.address || null,
            city: formData.city || null,
            state: formData.state || null,
            pincode: formData.pincode || null,
            latitude: formData.latitude || null,
            longitude: formData.longitude || null,
            avatar_url: avatarUrl || null
          }

          // Use the database function for profile creation
          const { data: profileResult, error: profileError } = await supabase
            .rpc('create_user_profile_on_signup', {
              p_user_id: data.user.id,
              p_full_name: formData.fullName,
              p_user_type: formData.userType,
              p_phone: formData.phone || '',
              p_bio: formData.bio || '',
              p_skills: formData.skills || [],
              p_interests: formData.interests || [],
              p_location_address: formData.address || '',
              p_city: formData.city || '',
              p_state: formData.state || '',
              p_pincode: formData.pincode || '',
              p_latitude: formData.latitude || 0,
              p_longitude: formData.longitude || 0
            })

          if (profileError || !(profileResult as any)?.success) {
            console.warn('Profile creation failed:', profileError || (profileResult as any)?.error)
            // Try direct insert as fallback
            try {
              const { error: retryError } = await supabase
                .from('user_profiles')
                .upsert(profileData as any, { onConflict: 'id' })
              
              if (retryError) {
                console.warn('Profile creation retry failed:', retryError)
              }
            } catch (retryErr) {
              console.warn('Profile creation retry failed:', retryErr)
            }
          }

          // If NGO, also create NGO application
          if (formData.userType === 'ngo') {
            try {
              const ngoData = {
                user_id: data.user.id,
                organization_name: formData.organizationName,
                registration_number: formData.registrationNumber,
                email: formData.organizationEmail,
                phone: formData.organizationPhone,
                website: formData.website,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                latitude: formData.latitude || 0,
                longitude: formData.longitude || 0,
                description: formData.description,
                focus_areas: formData.focusAreas,
                established_year: parseInt(formData.establishedYear),
                team_size: formData.teamSize
              }

              // Use the database function for NGO application creation
              const { data: ngoResult, error: ngoError } = await supabase
                .rpc('create_ngo_application_on_signup', {
                  p_user_id: data.user.id,
                  p_organization_name: formData.organizationName,
                  p_registration_number: formData.registrationNumber,
                  p_email: formData.organizationEmail,
                  p_phone: formData.organizationPhone,
                  p_website: formData.website || '',
                  p_address: formData.address,
                  p_city: formData.city,
                  p_state: formData.state,
                  p_pincode: formData.pincode,
                  p_latitude: formData.latitude || 0,
                  p_longitude: formData.longitude || 0,
                  p_description: formData.description,
                  p_focus_areas: formData.focusAreas || [],
                  p_established_year: parseInt(formData.establishedYear) || 0,
                  p_team_size: formData.teamSize
                })

              if (ngoError || !(ngoResult as any)?.success) {
                console.warn('NGO application creation failed:', ngoError || (ngoResult as any)?.error)
                // Try direct insert as fallback
                try {
                  const { error: retryError } = await supabase
                    .from('ngo_applications')
                    .insert(ngoData as any)
                  
                  if (retryError) {
                    console.warn('NGO application creation retry failed:', retryError)
                  }
                } catch (retryErr) {
                  console.warn('NGO application creation retry failed:', retryErr)
                }
              }
            } catch (ngoErr) {
              console.warn('NGO application creation error:', ngoErr)
            }
          }
        } catch (profileErr) {
          console.warn('Profile creation error:', profileErr)
          // Don't fail the signup if profile creation fails
        }
      }

      // Show success message and redirect
      alert('Account created successfully! Check your email for verification link.')
      navigate('/login')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50/30 to-orange-50 flex items-center justify-center pt-16 pb-8 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full mx-4 relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex items-center justify-center space-x-2 mb-4"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <MapPin className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">Mauka</span>
          </motion.div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">Join Mauka</h1>
          <p className="text-gray-600 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-500" />
            Start your journey of making a difference
          </p>
        </div>

        {/* Signup Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-100"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I want to join as a
              </label>
              <select
                name="userType"
                value={formData.userType}
                onChange={handleInputChange}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              >
                <option value="volunteer">Volunteer</option>
                <option value="ngo">NGO Representative</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.userType === 'ngo' ? 'Contact Person Name' : 'Full Name'}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder={formData.userType === 'ngo' ? 'Enter contact person name' : 'Enter your full name'}
                  required
                />
              </div>
            </div>

            {/* Profile Picture Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Picture (Optional)
              </label>
              <div className="flex items-center space-x-4">
                {profilePicturePreview ? (
                  <div className="relative">
                    <img
                      src={profilePicturePreview}
                      alt="Profile preview"
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removeProfilePicture}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                    id="profile-picture-upload"
                  />
                  <label
                    htmlFor="profile-picture-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {profilePicturePreview ? 'Change Photo' : 'Upload Photo'}
                  </label>
                  <p className="mt-2 text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* NGO-specific fields */}
            {formData.userType === 'ngo' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter organization name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Number *
                  </label>
                  <input
                    type="text"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="12A/80G registration number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Email *
                  </label>
                  <input
                    type="email"
                    name="organizationEmail"
                    value={formData.organizationEmail}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="contact@yourorganization.org"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Phone *
                  </label>
                  <input
                    type="tel"
                    name="organizationPhone"
                    value={formData.organizationPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="+91 XXXXX XXXXX"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="https://yourorganization.org"
                  />
                </div>

                {/* Location Selection with Mapbox */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Location *
                  </label>
                  
                  {/* Auto-detect button */}
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={detectingLocation}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>{detectingLocation ? 'Detecting...' : 'Detect My Location'}</span>
                    </button>
                    {locationStatus && (
                      <p className="text-sm text-gray-600 mt-2">{locationStatus}</p>
                    )}
                  </div>

                  <div className="relative">
                    <div 
                      ref={mapContainerNGO}
                      className="w-full h-64 rounded-lg border border-gray-300"
                      style={{ minHeight: '256px' }}
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
                    Use the search box on the map to find and select your organization's location, or click "Detect My Location" above. The address fields will be automatically filled.
                  </p>
                </div>

                {/* Selected Location Display */}
                {formData.address && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-medium text-orange-900 mb-2">Selected Location:</h4>
                    <p className="text-sm text-orange-800 mb-2">{formData.address}</p>
                    {locationStatus && (
                      <p className="text-xs text-orange-600">{locationStatus}</p>
                    )}
                  </div>
                )}

                {/* Address Details (Read-only, auto-populated) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      readOnly
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      placeholder="Auto-filled from map selection"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      readOnly
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      placeholder="Auto-filled from map selection"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      readOnly
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      placeholder="Auto-filled from map selection"
                      required
                    />
                  </div>
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Describe your organization's mission and activities..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Focus Areas * (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {focusAreaOptions.map((area) => (
                      <label key={area} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.focusAreas.includes(area)}
                          onChange={() => handleArrayChange('focusAreas', area)}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">{area}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Established Year *
                    </label>
                    <input
                      type="number"
                      name="establishedYear"
                      value={formData.establishedYear}
                      onChange={handleInputChange}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="2020"
                      min="1900"
                      max={new Date().getFullYear()}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Team Size *
                    </label>
                    <select
                      name="teamSize"
                      value={formData.teamSize}
                      onChange={handleInputChange}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    >
                      <option value="">Select team size</option>
                      <option value="1-5">1-5 members</option>
                      <option value="6-15">6-15 members</option>
                      <option value="16-50">16-50 members</option>
                      <option value="51-100">51-100 members</option>
                      <option value="100+">100+ members</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Volunteer-specific fields */}
            {formData.userType === 'volunteer' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Tell us about yourself and your interests..."
                  />
                </div>

                {/* Location Selection for Volunteers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Location *
                  </label>
                  
                  {/* Geolocation Button */}
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={detectingLocation}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>
                        {detectingLocation 
                          ? 'Getting your location...' 
                          : 'Use my current location'
                        }
                      </span>
                    </button>
                    <p className="text-xs text-gray-500 mt-1">
                      We need your location to show you nearby volunteer opportunities. Your location data is kept private and secure.
                    </p>
                  </div>

                  <div className="relative">
                    <div 
                      ref={mapContainerVolunteer}
                      className="w-full h-48 rounded-lg border border-gray-300"
                      style={{ minHeight: '192px' }}
                    />
                    {!mapLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto mb-2"></div>
                          <p className="text-xs text-gray-600">Loading map...</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Use the search box on the map to find and select your location. This is required to show you relevant opportunities in your area.
                  </p>
                </div>

                {/* Selected Location Display for Volunteers */}
                {formData.address && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="font-medium text-blue-900 mb-1">Selected Location:</h4>
                    <p className="text-sm text-blue-800 mb-1">{formData.address}</p>
                    {locationStatus && (
                      <p className="text-xs text-blue-600">{locationStatus}</p>
                    )}
                  </div>
                )}

                {/* Location Status for Volunteers */}
                {locationStatus && !formData.address && (
                  <div className={`p-3 rounded-lg border ${
                    locationStatus.includes('✅') 
                      ? 'bg-green-50 border-green-200 text-green-800' 
                      : locationStatus.includes('❌')
                      ? 'bg-red-50 border-red-200 text-red-800'
                      : 'bg-blue-50 border-blue-200 text-blue-800'
                  }`}>
                    <p className="text-sm">{locationStatus}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {skillOptions.map((skill) => (
                      <label key={skill} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.skills.includes(skill)}
                          onChange={() => handleArrayChange('skills', skill)}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">{skill}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interests (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {interestOptions.map((interest) => (
                      <label key={interest} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.interests.includes(interest)}
                          onChange={() => handleArrayChange('interests', interest)}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">{interest}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                className="mt-1 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                required
              />
              <label className="ml-2 text-sm text-gray-600">
                I agree to the{' '}
                <Link to="/terms" className="text-orange-600 hover:text-orange-700">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-orange-600 hover:text-orange-700">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Social Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="ml-2">Google</span>
              </button>

              <button
                type="button"
                className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="ml-2">Facebook</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Login Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-transparent bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text hover:from-orange-700 hover:to-pink-700 transition-all">
              Sign in here →
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Signup
