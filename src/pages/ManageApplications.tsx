import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { applicationService } from '../services/supabaseService'
import { Check, X, User, Phone, Calendar, Clock } from 'lucide-react'
import type { VolunteerApplication } from '../types/database'

const ManageApplications: React.FC = () => {
  const [applications, setApplications] = useState<VolunteerApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const { user } = useAuth()

  useEffect(() => {
    loadApplications()
  }, [user])

  const loadApplications = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await applicationService.getApplicationsForMyOpportunities()
      setApplications(data)
    } catch (err) {
      console.error('Error loading applications:', err)
      setError('Failed to load applications. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (applicationId: string, status: 'approved' | 'rejected') => {
    try {
      setProcessingId(applicationId)
      await applicationService.updateApplicationStatus(applicationId, status)
      
      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status, reviewed_at: new Date().toISOString() }
            : app
        )
      )
    } catch (err) {
      console.error('Error updating application:', err)
      alert('Failed to update application status')
    } finally {
      setProcessingId(null)
    }
  }

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true
    return app.status === filter
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Volunteer Applications</h1>
          <p className="text-gray-600 mt-2">Review and manage applications to your opportunities</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Total Applications</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Pending Review</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Approved</p>
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Rejected</p>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'approved'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved ({stats.approved})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'rejected'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejected ({stats.rejected})
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500">No applications found</p>
            </div>
          ) : (
            filteredApplications.map((application) => (
              <div key={application.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Opportunity Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {application.opportunity?.title}
                    </h3>

                    {/* Volunteer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{application.volunteer?.full_name}</span>
                      </div>
                      {application.volunteer?.phone && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{application.volunteer?.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Applied {new Date(application.applied_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Volunteer Skills */}
                    {application.volunteer?.skills && application.volunteer.skills.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {application.volunteer.skills.map((skill, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Volunteer Bio */}
                    {application.volunteer?.bio && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">About:</p>
                        <p className="text-sm text-gray-600">{application.volunteer.bio}</p>
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="ml-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(application.status)}`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {application.status === 'pending' && (
                  <div className="flex space-x-3 mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleUpdateStatus(application.id, 'approved')}
                      disabled={processingId === application.id}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="w-4 h-4" />
                      <span>{processingId === application.id ? 'Approving...' : 'Approve'}</span>
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(application.id, 'rejected')}
                      disabled={processingId === application.id}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="w-4 h-4" />
                      <span>{processingId === application.id ? 'Rejecting...' : 'Reject'}</span>
                    </button>
                  </div>
                )}

                {/* Reviewed Info */}
                {application.reviewed_at && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Reviewed on {new Date(application.reviewed_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default ManageApplications
