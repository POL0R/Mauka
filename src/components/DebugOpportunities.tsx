import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const DebugOpportunities: React.FC = () => {
  const { user } = useAuth()
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runDebug = async () => {
    if (!user) return

    setLoading(true)
    try {
      // 1. Check NGO status
      const { data: ngoData, error: ngoError } = await supabase
        .from('ngo_applications')
        .select('verification_status, organization_name')
        .eq('user_id', user.id)
        .single()

      // 2. Check opportunities created
      const { data: opportunities, error: oppError } = await supabase
        .from('volunteer_opportunities')
        .select('*')
        .eq('ngo_id', user.id)

      // 3. Check all approved NGOs
      const { data: approvedNGOs, error: approvedError } = await supabase
        .from('ngo_applications')
        .select('user_id, organization_name')
        .eq('verification_status', 'approved')

      // 4. Check opportunities from approved NGOs
      const approvedNGOIds = approvedNGOs?.map((ngo: any) => ngo.user_id) || []
      const { data: visibleOpportunities, error: visibleError } = await supabase
        .from('volunteer_opportunities')
        .select('*')
        .eq('status', 'active')
        .in('ngo_id', approvedNGOIds)

      setDebugInfo({
        userEmail: user.email,
        ngoStatus: (ngoData as any)?.verification_status || 'No NGO application found',
        ngoName: (ngoData as any)?.organization_name || 'N/A',
        myOpportunities: opportunities?.length || 0,
        myOpportunitiesList: opportunities || [],
        approvedNGOsCount: approvedNGOs?.length || 0,
        visibleOpportunitiesCount: visibleOpportunities?.length || 0,
        visibleOpportunitiesList: visibleOpportunities || [],
        errors: {
          ngoError,
          oppError,
          approvedError,
          visibleError
        }
      })
    } catch (error) {
      console.error('Debug error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      runDebug()
    }
  }, [user])

  if (!user) {
    return <div className="p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
      <p className="text-yellow-800">Please log in to see debug information</p>
    </div>
  }

  return (
    <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">🔍 Opportunity Debug Information</h3>
      
      <button 
        onClick={runDebug}
        disabled={loading}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Checking...' : 'Refresh Debug Info'}
      </button>

      {debugInfo && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-2">Your Account Info</h4>
            <p><strong>Email:</strong> {debugInfo.userEmail}</p>
            <p><strong>NGO Status:</strong> 
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                debugInfo.ngoStatus === 'approved' ? 'bg-green-100 text-green-800' :
                debugInfo.ngoStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                debugInfo.ngoStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {debugInfo.ngoStatus}
              </span>
            </p>
            <p><strong>Organization:</strong> {debugInfo.ngoName}</p>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-2">Your Opportunities</h4>
            <p><strong>Total Created:</strong> {debugInfo.myOpportunities}</p>
            {debugInfo.myOpportunitiesList.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium">Opportunity Details:</p>
                {debugInfo.myOpportunitiesList.map((opp: any) => (
                  <div key={opp.id} className="mt-1 p-2 bg-gray-50 rounded text-sm">
                    <p><strong>Title:</strong> {opp.title}</p>
                    <p><strong>Status:</strong> {opp.status}</p>
                    <p><strong>Category:</strong> {opp.category}</p>
                    <p><strong>Location:</strong> {opp.city}, {opp.state}</p>
                    <p><strong>Created:</strong> {new Date(opp.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-2">System Status</h4>
            <p><strong>Approved NGOs:</strong> {debugInfo.approvedNGOsCount}</p>
            <p><strong>Visible Opportunities:</strong> {debugInfo.visibleOpportunitiesCount}</p>
          </div>

          {debugInfo.visibleOpportunitiesList.length > 0 && (
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium text-gray-900 mb-2">All Visible Opportunities</h4>
                {debugInfo.visibleOpportunitiesList.map((opp: any) => (
                <div key={opp.id} className="mt-2 p-2 bg-green-50 rounded text-sm">
                  <p><strong>Title:</strong> {opp.title}</p>
                  <p><strong>Category:</strong> {opp.category}</p>
                  <p><strong>Location:</strong> {opp.city}, {opp.state}</p>
                </div>
              ))}
            </div>
          )}

          {Object.values(debugInfo.errors).some(error => error) && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="font-medium text-red-900 mb-2">Errors Found</h4>
              {Object.entries(debugInfo.errors).map(([key, error]: [string, any]) => (
                error && (
                  <p key={key} className="text-sm text-red-700">
                    <strong>{key}:</strong> {error.message}
                  </p>
                )
              ))}
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">💡 Troubleshooting Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• If NGO Status is "pending", your opportunities won't show until approved</li>
              <li>• If NGO Status is "rejected", contact admin for review</li>
              <li>• If you have 0 opportunities, create one using the "Add Opportunity" button</li>
              <li>• If opportunities exist but aren't visible, check if status is "active"</li>
              <li>• Make sure you have location data (city, state) in your opportunities</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default DebugOpportunities
