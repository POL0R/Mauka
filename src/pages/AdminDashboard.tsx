import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Eye, Clock, Building, MapPin, Calendar, Users, Heart, Tag, TrendingUp, MessageSquare, Mail, Phone } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { NGOApplication, UserProfile, VolunteerOpportunity } from '../types/database'

interface PendingNGO {
  id: string
  full_name: string
  organization_name: string
  email: string
  phone: string
  city: string
  state: string
  description: string
  focus_areas: string[]
  established_year: number
  team_size: string
  created_at: string
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'ngos' | 'users' | 'opportunities' | 'stats' | 'messages'>('stats')
  const [pendingNGOs, setPendingNGOs] = useState<PendingNGO[]>([])
  const [allNGOs, setAllNGOs] = useState<any[]>([])
  const [allUsers, setAllUsers] = useState<UserProfile[]>([])
  const [allOpportunities, setAllOpportunities] = useState<any[]>([])
  const [contactMessages, setContactMessages] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVolunteers: 0,
    totalNGOs: 0,
    totalOpportunities: 0,
    totalApplications: 0,
    pendingNGOs: 0,
    unreadMessages: 0
  })
  const [loading, setLoading] = useState(true)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [selectedNGO, setSelectedNGO] = useState<PendingNGO | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (!dataLoaded) {
      loadAllData()
    }
  }, [])

  const loadAllData = async () => {
    try {
      setLoading(true)
      
      // Load all data in parallel for better performance
      await Promise.all([
        loadPendingNGOs(),
        loadAllNGOs(),
        loadAllUsers(),
        loadAllOpportunities(),
        loadContactMessages(),
        loadStats()
      ])
      
      setDataLoaded(true)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPendingNGOs = async () => {
    const { data, error } = await supabase.rpc('get_pending_ngos')
    if (error) throw error
    setPendingNGOs(data || [])
  }

  const loadAllNGOs = async () => {
    const { data, error } = await supabase
      .from('ngo_applications')
      .select(`
        *,
        user_profiles!ngo_applications_user_id_fkey(full_name, phone)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    setAllNGOs(data || [])
  }

  const loadAllUsers = async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    setAllUsers(data || [])
  }

  const loadAllOpportunities = async () => {
    const { data, error } = await supabase
      .from('volunteer_opportunities')
      .select(`
        *,
        user_profiles!volunteer_opportunities_ngo_id_fkey(full_name)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    setAllOpportunities(data || [])
  }

  const loadContactMessages = async () => {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    setContactMessages(data || [])
  }

  const markMessageAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: 'read' })
        .eq('id', messageId)
      
      if (error) throw error
      
      // Update local state
      setContactMessages(prev => 
        prev.map(msg => msg.id === messageId ? { ...msg, status: 'read' } : msg)
      )
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  const loadStats = async () => {
    // Get all stats in parallel
    const [usersRes, ngosRes, oppsRes, appsRes, pendingRes, messagesRes] = await Promise.all([
      supabase.from('user_profiles').select('user_type', { count: 'exact', head: true }),
      supabase.from('ngo_applications').select('*', { count: 'exact', head: true }),
      supabase.from('volunteer_opportunities').select('*', { count: 'exact', head: true }),
      supabase.from('volunteer_applications').select('*', { count: 'exact', head: true }),
      supabase.from('ngo_applications').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
      supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('status', 'unread')
    ])

    const { data: volunteers } = await supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('user_type', 'volunteer')

    setStats({
      totalUsers: usersRes.count || 0,
      totalVolunteers: volunteers?.count || 0,
      totalNGOs: ngosRes.count || 0,
      totalOpportunities: oppsRes.count || 0,
      totalApplications: appsRes.count || 0,
      pendingNGOs: pendingRes.count || 0,
      unreadMessages: messagesRes.count || 0
    })
  }

  const approveNGO = async (ngoId: string) => {
    try {
      setProcessing(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      const { data, error } = await supabase.rpc('approve_ngo', {
        p_ngo_id: ngoId,
        p_admin_id: user.id,
        p_admin_notes: adminNotes || null
      })

      if (error) throw error
      
      if (data?.success) {
        alert('NGO approved successfully!')
        setSelectedNGO(null)
        setAdminNotes('')
        loadAllData()
      } else {
        alert('Failed to approve NGO: ' + (data?.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error approving NGO:', error)
      alert('Failed to approve NGO')
    } finally {
      setProcessing(false)
    }
  }

  const rejectNGO = async (ngoId: string) => {
    try {
      setProcessing(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      const { data, error } = await supabase.rpc('reject_ngo', {
        p_ngo_id: ngoId,
        p_admin_id: user.id,
        p_admin_notes: adminNotes || null
      })

      if (error) throw error
      
      if (data?.success) {
        alert('NGO rejected successfully!')
        setSelectedNGO(null)
        setAdminNotes('')
        loadAllData()
      } else {
        alert('Failed to reject NGO: ' + (data?.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error rejecting NGO:', error)
      alert('Failed to reject NGO')
    } finally {
      setProcessing(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pending NGOs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage platform users, NGOs, and opportunities</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex space-x-1 p-2">
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'stats'
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'pending'
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Pending NGOs ({pendingNGOs.length})
            </button>
            <button
              onClick={() => setActiveTab('ngos')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'ngos'
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Building className="w-4 h-4 inline mr-2" />
              All NGOs
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'users'
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              All Users
            </button>
            <button
              onClick={() => setActiveTab('opportunities')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'opportunities'
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Heart className="w-4 h-4 inline mr-2" />
              Opportunities
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'messages'
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Messages {stats.unreadMessages > 0 && `(${stats.unreadMessages})`}
            </button>
          </div>
        </div>

        {/* Stats Overview Tab */}
        {activeTab === 'stats' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100">
                    <Heart className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Volunteers</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalVolunteers}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-orange-100">
                    <Building className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">NGOs</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalNGOs}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100">
                    <Tag className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Opportunities</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalOpportunities}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100">
                    <CheckCircle className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Applications</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-red-100">
                    <Clock className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pending NGOs</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingNGOs}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending NGOs Tab */}
        {activeTab === 'pending' && (
          pendingNGOs.length === 0 ? (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending applications</h3>
            <p className="text-gray-500">All NGO applications have been reviewed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending NGOs List */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Pending Applications ({pendingNGOs.length})
              </h2>
              
              {pendingNGOs.map((ngo) => (
                <div
                  key={ngo.id}
                  className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-colors ${
                    selectedNGO?.id === ngo.id ? 'ring-2 ring-orange-500' : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedNGO(ngo)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {ngo.organization_name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Contact: {ngo.full_name}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 mt-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        {ngo.city}, {ngo.state}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        Established: {ngo.established_year}
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDate(ngo.created_at)}
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1">
                      {ngo.focus_areas.slice(0, 3).map((area, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
                        >
                          {area}
                        </span>
                      ))}
                      {ngo.focus_areas.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{ngo.focus_areas.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* NGO Details and Actions */}
            {selectedNGO && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Review Application
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900">Organization Details</h3>
                    <div className="mt-2 space-y-2 text-sm">
                      <div><strong>Name:</strong> {selectedNGO.organization_name}</div>
                      <div><strong>Contact Person:</strong> {selectedNGO.full_name}</div>
                      <div><strong>Email:</strong> {selectedNGO.email}</div>
                      <div><strong>Phone:</strong> {selectedNGO.phone}</div>
                      <div><strong>Location:</strong> {selectedNGO.city}, {selectedNGO.state}</div>
                      <div><strong>Established:</strong> {selectedNGO.established_year}</div>
                      <div><strong>Team Size:</strong> {selectedNGO.team_size}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900">Description</h3>
                    <p className="text-sm text-gray-600 mt-1">{selectedNGO.description}</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900">Focus Areas</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedNGO.focus_areas.map((area, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Notes (Optional)
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      rows={3}
                      placeholder="Add notes about the approval/rejection decision..."
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => approveNGO(selectedNGO.id)}
                      disabled={processing}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => rejectNGO(selectedNGO.id)}
                      disabled={processing}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* All NGOs Tab */}
        {activeTab === 'ngos' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allNGOs.map((ngo) => (
                  <tr key={ngo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{ngo.organization_name}</div>
                      <div className="text-sm text-gray-500">{ngo.user_profiles?.full_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{ngo.email}</div>
                      <div className="text-sm text-gray-500">{ngo.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ngo.city}, {ngo.state}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        ngo.verification_status === 'approved' 
                          ? 'bg-green-100 text-green-800'
                          : ngo.verification_status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {ngo.verification_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(ngo.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* All Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verified</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                      <div className="text-sm text-gray-500">{user.phone || 'No phone'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                        user.user_type === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : user.user_type === 'ngo'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.user_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.city && user.state ? `${user.city}, ${user.state}` : 'Not set'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.is_verified ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-300" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* All Opportunities Tab */}
        {activeTab === 'opportunities' && (
          <div className="grid grid-cols-1 gap-4">
            {allOpportunities.map((opp) => (
              <div key={opp.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{opp.title}</h3>
                    <p className="text-sm text-orange-600 mt-1">{opp.user_profiles?.full_name}</p>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{opp.description}</p>
                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {opp.city}, {opp.state}
                      </div>
                      <div className="flex items-center">
                        <Tag className="w-4 h-4 mr-1" />
                        {opp.category}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {opp.volunteers_applied || 0}/{opp.max_volunteers || 0} filled
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(opp.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      opp.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : opp.status === 'closed'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {opp.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contact Messages Tab */}
        {activeTab === 'messages' && (
          <div className="space-y-4">
            {contactMessages.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No contact messages</p>
              </div>
            ) : (
              contactMessages.map((message) => (
                <div key={message.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{message.subject}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          message.status === 'unread'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {message.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {message.name}
                        </div>
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {message.email}
                        </div>
                        {message.phone && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {message.phone}
                          </div>
                        )}
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(message.created_at)}
                        </div>
                      </div>
                    </div>
                    {message.status === 'unread' && (
                      <button
                        onClick={() => markMessageAsRead(message.id)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{message.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
