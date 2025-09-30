import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { User, MapPin, Heart, Users, Award, Calendar, ArrowRight, Plus, Tag, Clock, Star, ExternalLink, X } from 'lucide-react'
import { userProfileService, statsService, applicationService } from '../services/supabaseService'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import NGOStatusBadge from '../components/NGOStatusBadge'
import DebugOpportunities from '../components/DebugOpportunities'
import LocationUpdatePrompt from '../components/LocationUpdatePrompt'
import type { UserProfile, UserStats, VolunteerApplication } from '../types/database'

const Dashboard: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [recentApplications, setRecentApplications] = useState<VolunteerApplication[]>([])
  const [ngoStatus, setNgoStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null)
  const [myOpportunities, setMyOpportunities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showLocationPrompt, setShowLocationPrompt] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<VolunteerApplication | null>(null)
  const { user, profile: authProfile, loading: authLoading } = useAuth()

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return
    }
    
    if (user) {
      loadDashboardData()
    } else {
      setLoading(false)
    }
  }, [user, authProfile, authLoading])

  // Add a fallback timeout to prevent infinite loading
  useEffect(() => {
    const fallbackTimeout = setTimeout(() => {
      if (loading) {
        setLoading(false)
      }
    }, 15000) // 15 second fallback

    return () => clearTimeout(fallbackTimeout)
  }, [loading])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError('')

      // Use profile from auth context if available, otherwise try to load it
      let profile = authProfile
      
      if (!profile && user) {
        try {
          profile = await userProfileService.getCurrentProfile()
        } catch (profileErr) {
          console.warn('Could not load user profile:', profileErr)
        }
      }

      setUserProfile(profile)

      // Check if user needs to set location
      if (profile && (!profile.latitude || !profile.longitude || !profile.city || !profile.state)) {
        setShowLocationPrompt(true)
      }

      // Load stats and applications only if user is authenticated
      if (user) {
        try {
          const [stats, applications] = await Promise.all([
            statsService.getUserStats().catch(err => {
              console.warn('Could not load user stats:', err)
              return {} // Return empty stats if function fails
            }),
            applicationService.getMyApplications().catch(err => {
              console.warn('Could not load applications:', err)
              return [] // Return empty array if function fails
            })
          ])

          setUserStats(stats)
          setRecentApplications(applications.slice(0, 5)) // Show only recent 5

          // Load NGO status if user is an NGO
          if (profile?.user_type === 'ngo') {
            try {
              const { data: ngoData, error: ngoError } = await supabase
                .from('ngo_applications')
                .select('verification_status')
                .eq('user_id', user.id)
                .single()

              if (!ngoError && ngoData) {
                setNgoStatus(ngoData.verification_status)
                
                // Load opportunities if approved
                if (ngoData.verification_status === 'approved') {
                  const { data: opportunities, error: oppError } = await supabase
                    .from('volunteer_opportunities')
                    .select('*')
                    .eq('ngo_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(5)

                  if (!oppError && opportunities) {
                    setMyOpportunities(opportunities)
                  }
                }
              }
            } catch (ngoErr) {
              console.warn('Could not load NGO status:', ngoErr)
            }
          }
        } catch (serviceErr) {
          console.warn('Could not load additional data:', serviceErr)
          // Stats and applications are already handled with individual catch blocks
        }
      }
    } catch (err) {
      console.error('Error loading dashboard:', err)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button onClick={loadDashboardData} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Location Update Prompt */}
        {showLocationPrompt && (
          <LocationUpdatePrompt
            onLocationUpdated={() => {
              setShowLocationPrompt(false)
              loadDashboardData() // Reload to get updated profile
            }}
            onDismiss={() => setShowLocationPrompt(false)}
          />
        )}

        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {userProfile?.full_name || user?.email || 'User'}!
              </h1>
              <p className="text-gray-600 mt-2">
                {userProfile?.user_type === 'volunteer' 
                  ? 'Here\'s your volunteer journey overview'
                  : userProfile?.user_type === 'ngo'
                  ? 'Manage your NGO activities and volunteers'
                  : 'Welcome to your dashboard'
                }
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {userProfile?.user_type === 'ngo' && ngoStatus && (
                <NGOStatusBadge status={ngoStatus} />
              )}
              {userProfile?.user_type === 'ngo' && ngoStatus === 'approved' && (
                <div className="flex space-x-3">
                  <Link
                    to="/manage-applications"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Manage Applications
                  </Link>
                  <Link
                    to="/add-opportunity"
                    className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Opportunity
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {!userProfile ? (
            // Fallback when no profile data
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-orange-100">
                    <User className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Profile Status</p>
                    <p className="text-2xl font-bold text-gray-900">Loading...</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100">
                    <Heart className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Account Type</p>
                    <p className="text-2xl font-bold text-gray-900">Unknown</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="text-2xl font-bold text-gray-900">Active</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100">
                    <MapPin className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <p className="text-2xl font-bold text-gray-900">Not Set</p>
                  </div>
                </div>
              </div>
            </>
          ) : userProfile?.user_type === 'volunteer' ? (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100">
                    <Heart className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Applications</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {userStats?.applications_count || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Approved</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {userStats?.approved_applications || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100">
                    <Calendar className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {userStats?.pending_applications || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-orange-100">
                    <MapPin className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <p className="text-sm font-bold text-gray-900">
                      {userProfile?.city || 'Not set'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Opportunities</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {userStats?.opportunities_posted || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100">
                    <Heart className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {userStats?.active_opportunities || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100">
                    <Award className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Applications</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {userStats?.total_applications_received || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100">
                    <User className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="text-sm font-bold text-gray-900">
                      {userStats?.verification_status || 'Pending'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Debug Information (for NGOs) */}
        {userProfile?.user_type === 'ngo' && (
          <div className="mb-8">
            <DebugOpportunities />
          </div>
        )}

        {/* My Opportunities (for NGOs) */}
        {userProfile?.user_type === 'ngo' && ngoStatus === 'approved' && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">My Opportunities</h2>
                <Link
                  to="/add-opportunity"
                  className="flex items-center text-orange-600 hover:text-orange-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add New
                </Link>
              </div>
            </div>
            <div className="p-6">
              {myOpportunities.length > 0 ? (
                <div className="space-y-4">
                  {myOpportunities.map((opportunity) => (
                    <div key={opportunity.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{opportunity.title}</h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {opportunity.description}
                          </p>
                          <div className="flex items-center text-sm text-gray-500 mt-2 space-x-4">
                            <span className="flex items-center">
                              <Tag className="w-4 h-4 mr-1" />
                              {opportunity.category}
                            </span>
                            <span className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {opportunity.city}, {opportunity.state}
                            </span>
                            <span className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {opportunity.volunteers_applied || 0} applications
                            </span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          opportunity.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {opportunity.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities yet</h3>
                  <p className="text-gray-500 mb-4">Create your first volunteer opportunity to get started.</p>
                  <Link
                    to="/add-opportunity"
                    className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Opportunity
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {userProfile?.user_type === 'volunteer' ? 'Recent Applications' : 'Recent Activity'}
              </h2>
            </div>
            <div className="p-6">
              {recentApplications.length > 0 ? (
                <div className="space-y-4">
                  {recentApplications.map((application) => (
                    <div 
                      key={application.id} 
                      onClick={() => {
                        setSelectedApplication(application)
                        setShowDetailsModal(true)
                      }}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {application.opportunity?.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {application.opportunity?.organization_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          Applied on {new Date(application.applied_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          application.status === 'approved' 
                            ? 'bg-green-100 text-green-800'
                            : application.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {application.status === 'approved' ? 'Accepted' : application.status === 'rejected' ? 'Rejected' : 'Pending'}
                        </span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500">No recent activity</div>
                  <p className="text-sm text-gray-400 mt-1">
                    {userProfile?.user_type === 'volunteer' 
                      ? 'Start applying to volunteer opportunities'
                      : 'Create your first opportunity posting'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Profile Summary */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {userProfile?.full_name || user?.email || 'User'}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">
                    {userProfile?.user_type || 'Loading...'}
                  </p>
                </div>
              </div>
              
              {userProfile?.bio && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Bio</p>
                  <p className="text-sm text-gray-600 mt-1">{userProfile.bio}</p>
                </div>
              )}
              
              {userProfile?.skills && userProfile.skills.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Skills</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {userProfile.skills.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <button className="w-full btn-primary">
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Details Modal */}
      {showDetailsModal && selectedApplication && selectedApplication.opportunity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedApplication.opportunity.title}
                  </h2>
                  <p className="text-lg text-orange-600 font-medium">
                    {selectedApplication.opportunity.organization_name}
                  </p>
                  <div className="mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedApplication.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : selectedApplication.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedApplication.status === 'approved' ? 'Accepted ✓' : selectedApplication.status === 'rejected' ? 'Rejected ✗' : 'Pending Review ⏳'}
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
                <p className="text-gray-600">{selectedApplication.opportunity.description}</p>
              </div>

              {/* Key Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Application Date */}
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Applied On</p>
                    <p className="text-base font-semibold text-gray-900">
                      {new Date(selectedApplication.applied_at).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Start Date */}
                {selectedApplication.opportunity.start_date && (
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Start Date</p>
                      <p className="text-base font-semibold text-gray-900">
                        {new Date(selectedApplication.opportunity.start_date).toLocaleDateString('en-US', {
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
                {selectedApplication.opportunity.end_date && (
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">End Date</p>
                      <p className="text-base font-semibold text-gray-900">
                        {new Date(selectedApplication.opportunity.end_date).toLocaleDateString('en-US', {
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
                {selectedApplication.opportunity.duration && (
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Time Commitment</p>
                      <p className="text-base font-semibold text-gray-900">
                        {selectedApplication.opportunity.duration}
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
                      {selectedApplication.opportunity.category?.replace('-', ' ')}
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
                    {selectedApplication.opportunity.location_address}
                  </p>
                  <p className="text-gray-600 text-sm mb-3">
                    {selectedApplication.opportunity.city}, {selectedApplication.opportunity.state} {selectedApplication.opportunity.pincode}
                  </p>
                  {selectedApplication.opportunity.latitude && selectedApplication.opportunity.longitude && (
                    <a
                      href={`https://www.google.com/maps?q=${selectedApplication.opportunity.latitude},${selectedApplication.opportunity.longitude}`}
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
              {selectedApplication.opportunity.requirements && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Requirements</h3>
                  <p className="text-gray-600">{selectedApplication.opportunity.requirements}</p>
                </div>
              )}

              {/* Skills Required */}
              {selectedApplication.opportunity.skills_required && selectedApplication.opportunity.skills_required.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Skills Required</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.opportunity.skills_required.map((skill, idx) => (
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

export default Dashboard
