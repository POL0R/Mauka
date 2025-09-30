import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Filter, Heart, Clock, Users, Star, Calendar, X, ExternalLink } from 'lucide-react'
import { opportunityService, userProfileService, applicationService } from '../services/supabaseService'
import { useAuth } from '../contexts/AuthContext'
import LocationUpdatePrompt from '../components/LocationUpdatePrompt'
import type { NearbyOpportunity, UserProfile } from '../types/database'

const Volunteer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [radius, setRadius] = useState('25')
  const [opportunities, setOpportunities] = useState<NearbyOpportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [showLocationPrompt, setShowLocationPrompt] = useState(false)
  const [applyingTo, setApplyingTo] = useState<string | null>(null)
  const [appliedOpportunities, setAppliedOpportunities] = useState<Set<string>>(new Set())
  const [applicationStatuses, setApplicationStatuses] = useState<Map<string, string>>(new Map())
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedOpportunityDetails, setSelectedOpportunityDetails] = useState<NearbyOpportunity | null>(null)
  const [favoriteOpportunities, setFavoriteOpportunities] = useState<Set<string>>(new Set())
  const { user } = useAuth()

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteOpportunities')
    if (savedFavorites) {
      try {
        const favArray = JSON.parse(savedFavorites)
        setFavoriteOpportunities(new Set(favArray))
      } catch (err) {
        console.error('Error loading favorites:', err)
      }
    }
  }, [])

  // Load user profile and opportunities
  useEffect(() => {
    loadUserAndOpportunities()
  }, [radius, selectedCategory, user])

  const loadUserAndOpportunities = async () => {
    try {
      setLoading(true)
      setError('')

      let profile: UserProfile | null = null

      // Only try to get user profile if user is authenticated
      if (user) {
        try {
          profile = await userProfileService.getCurrentProfile()
          setUserProfile(profile)
          
          // Check if user needs to set location
          if (profile && (!profile.latitude || !profile.longitude || !profile.city || !profile.state)) {
            setShowLocationPrompt(true)
          }

          // Load user's existing applications
          try {
            const applications = await applicationService.getMyApplications()
            const appliedIds = new Set(applications.map(app => app.opportunity_id))
            const statusMap = new Map(applications.map(app => [app.opportunity_id, app.status]))
            setAppliedOpportunities(appliedIds)
            setApplicationStatuses(statusMap)
          } catch (appErr) {
            console.warn('Could not load user applications:', appErr)
          }
        } catch (profileErr) {
          console.warn('Could not load user profile:', profileErr)
          // Continue without profile
        }
      }

      // Load opportunities based on user's location or all opportunities
      if (profile?.latitude && profile?.longitude) {
        // Load nearby opportunities for authenticated users with location
        const nearby = await opportunityService.getNearbyOpportunities(
          profile.latitude,
          profile.longitude,
          parseInt(radius),
          selectedCategory === 'all' ? undefined : selectedCategory
        )
        setOpportunities(nearby)
      } else {
        // Load all opportunities for non-authenticated users or users without location
        const allOpps = await opportunityService.getOpportunities({
          category: selectedCategory === 'all' ? undefined : selectedCategory
        })
        setOpportunities(allOpps.map(opp => ({ ...opp, distance_km: 0 })))
      }
    } catch (err) {
      console.error('Error loading opportunities:', err)
      setError('Failed to load opportunities. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'education', label: 'Education' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'environment', label: 'Environment' },
    { value: 'social-service', label: 'Social Service' },
    { value: 'disaster-relief', label: 'Disaster Relief' },
    { value: 'animal-welfare', label: 'Animal Welfare' }
  ]

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'education': return '📚'
      case 'healthcare': return '🏥'
      case 'environment': return '🌱'
      case 'social-service': return '🤝'
      case 'disaster-relief': return '🆘'
      case 'animal-welfare': return '🐕'
      default: return '❤️'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'education': return 'bg-blue-100 text-blue-800'
      case 'healthcare': return 'bg-red-100 text-red-800'
      case 'environment': return 'bg-green-100 text-green-800'
      case 'social-service': return 'bg-purple-100 text-purple-800'
      case 'disaster-relief': return 'bg-orange-100 text-orange-800'
      case 'animal-welfare': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const toggleFavorite = (opportunityId: string) => {
    setFavoriteOpportunities(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(opportunityId)) {
        newFavorites.delete(opportunityId)
      } else {
        newFavorites.add(opportunityId)
      }
      
      // Save to localStorage
      localStorage.setItem('favoriteOpportunities', JSON.stringify(Array.from(newFavorites)))
      
      return newFavorites
    })
  }

  const handleButtonClick = (opportunity: NearbyOpportunity) => {
    const status = applicationStatuses.get(opportunity.id)
    
    // If accepted or pending, show details modal
    if (status === 'approved' || status === 'pending') {
      setSelectedOpportunityDetails(opportunity)
      setShowDetailsModal(true)
      return
    }
    
    // If rejected or not applied, allow applying
    if (!user) {
      alert('Please sign in to apply for opportunities')
      return
    }

    // Prevent NGOs from applying
    if (userProfile?.user_type === 'ngo') {
      alert('NGOs cannot apply to volunteer opportunities. Only volunteers can apply.')
      return
    }

    if (status === 'rejected') {
      alert('Your previous application was rejected. You cannot reapply to this opportunity.')
      return
    }

    // Apply to opportunity
    handleApplyClick(opportunity)
  }

  const handleApplyClick = async (opportunity: NearbyOpportunity) => {
    const existingStatus = applicationStatuses.get(opportunity.id)
    if (existingStatus) {
      alert(`You have already applied to this opportunity. Status: ${existingStatus}`)
      return
    }

    try {
      setApplyingTo(opportunity.id)
      
      await applicationService.applyToOpportunity({
        opportunity_id: opportunity.id,
        cover_letter: '',
        availability: '',
        experience: ''
      })

      // Mark as applied with pending status
      setAppliedOpportunities(prev => new Set(prev).add(opportunity.id))
      setApplicationStatuses(prev => new Map(prev).set(opportunity.id, 'pending'))
      alert('Application submitted successfully!')
      
      // Reload opportunities to update applied count
      loadUserAndOpportunities()
    } catch (err: any) {
      console.error('Error submitting application:', err)
      if (err.code === '23505') {
        alert('You have already applied to this opportunity')
        setAppliedOpportunities(prev => new Set(prev).add(opportunity.id))
        setApplicationStatuses(prev => new Map(prev).set(opportunity.id, 'pending'))
      } else {
        alert('Failed to submit application. Please try again.')
      }
    } finally {
      setApplyingTo(null)
    }
  }

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.ngo_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || opp.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Find Volunteer Opportunities</h1>
            <p className="text-xl text-orange-100 max-w-2xl mx-auto">
              Discover meaningful ways to make a difference in your community
            </p>
          </div>
        </div>
      </div>

      {/* Location Update Prompt */}
      {showLocationPrompt && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <LocationUpdatePrompt
            onLocationUpdated={() => {
              setShowLocationPrompt(false)
              loadUserAndOpportunities() // Reload to get updated profile and opportunities
            }}
            onDismiss={() => setShowLocationPrompt(false)}
          />
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="bg-white shadow-sm border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search opportunities, organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none bg-white"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Radius Filter */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none bg-white"
              >
                <option value="5">Within 5 km</option>
                <option value="10">Within 10 km</option>
                <option value="25">Within 25 km</option>
                <option value="50">Within 50 km</option>
                <option value="100">Within 100 km</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {filteredOpportunities.length} Opportunities Found
          </h2>
          <div className="text-sm text-gray-500">
            {user ? `Showing results within ${radius} km of your location` : 'Showing all available opportunities'}
          </div>
        </div>

        {/* Sign up prompt for non-authenticated users */}
        {!user && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-orange-900">Get Personalized Results</h3>
                <p className="text-orange-800 text-sm">
                  Sign up to see opportunities near your location and apply to volunteer positions.
                </p>
              </div>
              <Link to="/signup" className="btn-primary whitespace-nowrap">
                Sign Up Now
              </Link>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading opportunities...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
            <button 
              onClick={loadUserAndOpportunities}
              className="mt-2 text-red-600 hover:text-red-700 font-medium"
            >
              Try again
            </button>
          </div>
        )}

        {/* Opportunities Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOpportunities.map((opportunity) => (
              <div key={opportunity.id} className="card p-6 hover:shadow-xl transition-all duration-300">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {opportunity.title}
                      </h3>
                      <p className="text-orange-600 font-medium">
                        {opportunity.organization_name}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(opportunity.category)}`}>
                      {getCategoryIcon(opportunity.category)} {categories.find(c => c.value === opportunity.category)?.label}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 line-clamp-2">
                    {opportunity.description}
                  </p>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span>{opportunity.location_address}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{opportunity.duration || 'Flexible'}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>
                          {Math.max(0, (opportunity.max_volunteers || 0) - (opportunity.volunteers_applied || 0))} seats left
                        </span>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-orange-600">
                      {opportunity.distance_km > 0 ? `${opportunity.distance_km.toFixed(1)} km away` : 'Location based'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 pt-4">
                    <button 
                      onClick={() => handleButtonClick(opportunity)}
                      disabled={
                        applyingTo === opportunity.id || 
                        (!user && !applicationStatuses.get(opportunity.id)) || 
                        applicationStatuses.get(opportunity.id) === 'rejected' ||
                        (userProfile?.user_type === 'ngo' && !applicationStatuses.get(opportunity.id))
                      }
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                        applicationStatuses.get(opportunity.id) === 'approved'
                          ? 'bg-green-100 text-green-800 border border-green-300 hover:bg-green-200 cursor-pointer'
                          : applicationStatuses.get(opportunity.id) === 'rejected'
                          ? 'bg-red-100 text-red-800 border border-red-300 cursor-not-allowed'
                          : applicationStatuses.get(opportunity.id) === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-300 hover:bg-yellow-200 cursor-pointer'
                          : userProfile?.user_type === 'ngo'
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'btn-primary disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                    >
                      {applyingTo === opportunity.id 
                        ? 'Applying...' 
                        : applicationStatuses.get(opportunity.id) === 'approved'
                        ? 'Accepted ✓ - View Details'
                        : applicationStatuses.get(opportunity.id) === 'rejected'
                        ? 'Rejected ✗'
                        : applicationStatuses.get(opportunity.id) === 'pending'
                        ? 'Pending ⏳ - View Details'
                        : userProfile?.user_type === 'ngo'
                        ? 'NGOs Cannot Apply'
                        : user 
                        ? 'Apply Now' 
                        : 'Sign in to Apply'}
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(opportunity.id)
                      }}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        favoriteOpportunities.has(opportunity.id)
                          ? 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100'
                          : 'bg-white border-gray-300 text-gray-400 hover:bg-gray-50 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${favoriteOpportunities.has(opportunity.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {filteredOpportunities.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No opportunities found</h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search criteria or expanding your search radius
            </p>
            <button 
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
                setRadius('25')
              }}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Opportunity Details Modal */}
      {showDetailsModal && selectedOpportunityDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedOpportunityDetails.title}
                  </h2>
                  <p className="text-lg text-orange-600 font-medium">
                    {selectedOpportunityDetails.ngo_name}
                  </p>
                  <div className="mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      applicationStatuses.get(selectedOpportunityDetails.id) === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {applicationStatuses.get(selectedOpportunityDetails.id) === 'approved' ? 'Accepted ✓' : 'Pending Review ⏳'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600">{selectedOpportunityDetails.description}</p>
              </div>

              {/* Key Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Start Date */}
                {selectedOpportunityDetails.start_date && (
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Start Date</p>
                      <p className="text-base font-semibold text-gray-900">
                        {new Date(selectedOpportunityDetails.start_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {/* End Date */}
                {selectedOpportunityDetails.end_date && (
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">End Date</p>
                      <p className="text-base font-semibold text-gray-900">
                        {new Date(selectedOpportunityDetails.end_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {/* Duration */}
                {selectedOpportunityDetails.duration && (
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Duration</p>
                      <p className="text-base font-semibold text-gray-900">
                        {selectedOpportunityDetails.duration}
                      </p>
                    </div>
                  </div>
                )}

                {/* Category */}
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Star className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Category</p>
                    <p className="text-base font-semibold text-gray-900 capitalize">
                      {selectedOpportunityDetails.category.replace('-', ' ')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-orange-600" />
                  Location
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900 font-medium mb-2">
                    {selectedOpportunityDetails.location_address}
                  </p>
                  <p className="text-gray-600 text-sm mb-3">
                    {selectedOpportunityDetails.city}, {selectedOpportunityDetails.state} {selectedOpportunityDetails.pincode}
                  </p>
                  {selectedOpportunityDetails.latitude && selectedOpportunityDetails.longitude && (
                    <a
                      href={`https://www.google.com/maps?q=${selectedOpportunityDetails.latitude},${selectedOpportunityDetails.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Open in Google Maps
                    </a>
                  )}
                </div>
              </div>

              {/* Requirements */}
              {selectedOpportunityDetails.requirements && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Requirements</h3>
                  <p className="text-gray-600">{selectedOpportunityDetails.requirements}</p>
                </div>
              )}

              {/* Skills Required */}
              {selectedOpportunityDetails.skills_required && selectedOpportunityDetails.skills_required.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Skills Required</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedOpportunityDetails.skills_required.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Volunteer
