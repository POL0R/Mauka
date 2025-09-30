import { supabase } from '../lib/supabase'
import type { 
  UserProfile, 
  NGOApplication, 
  VolunteerOpportunity, 
  VolunteerApplication,
  NearbyOpportunity,
  UserStats,
  LocationCache
} from '../types/database'

// User Profile Services
export const userProfileService = {
  async getCurrentProfile(): Promise<UserProfile | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error
    return data
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates as any)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getProfile(id: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }
}

// NGO Application Services
export const ngoApplicationService = {
  async submitApplication(application: Omit<NGOApplication, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'verification_status'>): Promise<NGOApplication> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    const { data, error } = await supabase
      .from('ngo_applications')
      .insert({
        ...application,
        user_id: user.id
      } as any)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getCurrentApplication(): Promise<NGOApplication | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('ngo_applications')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async updateApplication(updates: Partial<NGOApplication>): Promise<NGOApplication> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    const { data, error } = await supabase
      .from('ngo_applications')
      .update(updates as any)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Volunteer Opportunity Services
export const opportunityService = {
  async createOpportunity(opportunity: Omit<VolunteerOpportunity, 'id' | 'ngo_id' | 'created_at' | 'updated_at' | 'volunteers_applied'>): Promise<VolunteerOpportunity> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    const { data, error } = await supabase
      .from('volunteer_opportunities')
      .insert({
        ...opportunity,
        ngo_id: user.id
      } as any)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getOpportunities(filters?: {
    category?: string
    city?: string
    state?: string
    status?: string
  }): Promise<VolunteerOpportunity[]> {
    // First, get all approved NGO user IDs
    const { data: approvedNGOs, error: ngoError } = await supabase
      .from('ngo_applications')
      .select('user_id')
      .eq('verification_status', 'approved')

    if (ngoError) throw ngoError

    const approvedNGOIds = approvedNGOs?.map((ngo: any) => ngo.user_id) || []

    if (approvedNGOIds.length === 0) {
      return [] // No approved NGOs, return empty array
    }

    // Now get opportunities from approved NGOs only
    let query = supabase
      .from('volunteer_opportunities')
      .select(`
        *,
        user_profiles!volunteer_opportunities_ngo_id_fkey(full_name)
      `)
      .eq('status', 'active')
      .in('ngo_id', approvedNGOIds)

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    if (filters?.city) {
      query = query.eq('city', filters.city)
    }
    if (filters?.state) {
      query = query.eq('state', filters.state)
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })

    if (error) throw error
    return data.map((item: any) => ({
      ...item,
      organization_name: item.user_profiles?.full_name
    }))
  },


  async getNearbyOpportunities(
    latitude: number,
    longitude: number,
    radiusKm: number = 25,
    category?: string,
    limit: number = 20
  ): Promise<NearbyOpportunity[]> {
    const { data, error } = await supabase.rpc('find_nearby_opportunities', {
      user_lat: latitude,
      user_lng: longitude,
      radius_km: radiusKm,
      category_filter: category,
      limit_count: limit
    } as any)

    if (error) throw error
    return data
  },

  async getOpportunity(id: string): Promise<VolunteerOpportunity | null> {
    const { data, error } = await supabase
      .from('volunteer_opportunities')
      .select(`
        *,
        user_profiles!volunteer_opportunities_ngo_id_fkey(full_name, phone, bio)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return {
      ...data,
      organization_name: (data as any).user_profiles?.full_name
    }
  },

  async updateOpportunity(id: string, updates: Partial<VolunteerOpportunity>): Promise<VolunteerOpportunity> {
    const { data, error } = await supabase
      .from('volunteer_opportunities')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteOpportunity(id: string): Promise<void> {
    const { error } = await supabase
      .from('volunteer_opportunities')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Volunteer Application Services
export const applicationService = {
  async applyToOpportunity(application: Omit<VolunteerApplication, 'id' | 'volunteer_id' | 'applied_at' | 'status'>): Promise<VolunteerApplication> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    const { data, error } = await supabase
      .from('volunteer_applications')
      .insert({
        ...application,
        volunteer_id: user.id
      } as any)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getMyApplications(): Promise<VolunteerApplication[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    const { data, error } = await supabase
      .from('volunteer_applications')
      .select(`
        *,
        volunteer_opportunities(
          id, title, description, category, location_address, city, state, pincode,
          latitude, longitude, duration, start_date, end_date, requirements, skills_required,
          user_profiles!volunteer_opportunities_ngo_id_fkey(full_name)
        )
      `)
      .eq('volunteer_id', user.id)
      .order('applied_at', { ascending: false })

    if (error) throw error
    return data.map((app: any) => ({
      ...app,
      opportunity: app.volunteer_opportunities ? {
        ...app.volunteer_opportunities,
        organization_name: app.volunteer_opportunities.user_profiles?.full_name
      } : undefined
    })) as VolunteerApplication[]
  },

  async getApplicationsForOpportunity(opportunityId: string): Promise<VolunteerApplication[]> {
    const { data, error } = await supabase
      .from('volunteer_applications')
      .select(`
        *,
        user_profiles!volunteer_applications_volunteer_id_fkey(
          id, full_name, bio, skills, city, state, phone
        )
      `)
      .eq('opportunity_id', opportunityId)
      .order('applied_at', { ascending: false })

    if (error) throw error
    return data.map((app: any) => ({
      ...app,
      volunteer: app.user_profiles
    })) as VolunteerApplication[]
  },

  async getApplicationsForMyOpportunities(): Promise<VolunteerApplication[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    const { data, error } = await supabase
      .from('volunteer_applications')
      .select(`
        *,
        volunteer_opportunities!inner(id, title, ngo_id),
        user_profiles!volunteer_applications_volunteer_id_fkey(id, full_name, phone, bio, skills)
      `)
      .eq('volunteer_opportunities.ngo_id', user.id)
      .order('applied_at', { ascending: false })

    if (error) throw error
    return data.map((app: any) => ({
      ...app,
      opportunity: app.volunteer_opportunities,
      volunteer: app.user_profiles
    })) as VolunteerApplication[]
  },

  async updateApplicationStatus(
    applicationId: string, 
    status: 'approved' | 'rejected', 
    ngoNotes?: string
  ): Promise<VolunteerApplication> {
    const { data, error } = await supabase
      .from('volunteer_applications')
      .update({ 
        status, 
        ngo_notes: ngoNotes,
        reviewed_at: new Date().toISOString()
      } as any)
      .eq('id', applicationId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Location Services
export const locationService = {
  async geocodeAddress(address: string): Promise<LocationCache | null> {
    // First check if we have this address cached
    const { data: cached, error: cacheError } = await supabase
      .from('location_cache')
      .select('*')
      .eq('address', address)
      .single()

    if (!cacheError && cached) {
      return cached
    }

    // If not cached, use Mapbox to geocode
    const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
    if (!mapboxToken) {
      throw new Error('Mapbox access token not configured')
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxToken}&country=IN`
      )
      
      if (!response.ok) {
        throw new Error('Geocoding failed')
      }

      const data = await response.json()
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0]
        const [longitude, latitude] = feature.center
        
        // Extract city and state from context
        const context = feature.context || []
        const city = context.find((c: any) => c.id.startsWith('place'))?.text
        const state = context.find((c: any) => c.id.startsWith('region'))?.text
        const pincode = context.find((c: any) => c.id.startsWith('postcode'))?.text

        const locationData = {
          address,
          city,
          state,
          pincode,
          latitude,
          longitude
        }

        // Cache the result
        const { data: cachedResult, error: insertError } = await supabase
          .from('location_cache')
          .insert(locationData as any)
          .select()
          .single()

        if (insertError) {
          console.warn('Failed to cache location:', insertError)
          return { ...locationData, id: '', created_at: new Date().toISOString() }
        }

        return cachedResult
      }

      return null
    } catch (error) {
      console.error('Geocoding error:', error)
      return null
    }
  },

  async calculateDistance(
    lat1: number, lng1: number,
    lat2: number, lng2: number
  ): Promise<number> {
    const { data, error } = await supabase.rpc('calculate_distance', {
      lat1, lng1, lat2, lng2
    } as any)

    if (error) throw error
    return data
  }
}

// Stats Services
export const statsService = {
  async getUserStats(userId?: string): Promise<UserStats> {
    const { data: { user } } = await supabase.auth.getUser()
    const targetUserId = userId || user?.id

    if (!targetUserId) throw new Error('No user ID provided')

    const { data, error } = await supabase.rpc('get_user_stats', {
      user_id_param: targetUserId
    } as any)

    if (error) throw error
    return data
  }
}
