export type UserType = 'volunteer' | 'ngo' | 'admin'
export type ApplicationStatus = 'pending' | 'approved' | 'rejected'
export type NGOVerificationStatus = 'pending' | 'approved' | 'rejected'
export type OpportunityStatus = 'active' | 'closed' | 'draft'

export interface UserProfile {
  id: string
  full_name: string
  user_type: UserType
  phone?: string
  bio?: string
  skills?: string[]
  interests?: string[]
  location_address?: string
  city?: string
  state?: string
  pincode?: string
  latitude?: number
  longitude?: number
  avatar_url?: string
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface NGOApplication {
  id: string
  user_id: string
  organization_name: string
  registration_number: string
  email: string
  phone: string
  website?: string
  address: string
  city: string
  state: string
  pincode: string
  latitude?: number
  longitude?: number
  description: string
  focus_areas: string[]
  established_year: number
  team_size: string
  documents?: any
  verification_status: NGOVerificationStatus
  admin_notes?: string
  verified_at?: string
  verified_by?: string
  created_at: string
  updated_at: string
}

export interface VolunteerOpportunity {
  id: string
  ngo_id: string
  title: string
  description: string
  requirements?: string
  category: string
  skills_required?: string[]
  location_address: string
  city: string
  state: string
  pincode?: string
  latitude: number
  longitude: number
  duration?: string
  time_commitment?: string
  volunteers_needed: number
  max_volunteers?: number
  volunteers_applied: number
  start_date?: string
  end_date?: string
  application_deadline?: string
  is_virtual?: boolean
  status: OpportunityStatus
  contact_person?: string
  contact_phone?: string
  contact_email?: string
  tags?: string[]
  created_at: string
  updated_at: string
  // Joined fields
  organization_name?: string
  distance_km?: number
}

export interface VolunteerApplication {
  id: string
  opportunity_id: string
  volunteer_id: string
  cover_letter?: string
  availability?: string
  experience?: string
  status: ApplicationStatus
  ngo_notes?: string
  applied_at: string
  reviewed_at?: string
  // Joined fields
  opportunity?: VolunteerOpportunity
  volunteer?: UserProfile
}

export interface LocationCache {
  id: string
  address: string
  city?: string
  state?: string
  pincode?: string
  latitude: number
  longitude: number
  created_at: string
}

export interface NearbyOpportunity extends VolunteerOpportunity {
  distance_km: number
  organization_name: string
  ngo_verification_status?: string
}

export interface NearbyVolunteer extends UserProfile {
  distance_km: number
}

export interface UserStats {
  // For volunteers
  applications_count?: number
  approved_applications?: number
  pending_applications?: number
  rejected_applications?: number
  // For NGOs
  opportunities_posted?: number
  active_opportunities?: number
  total_applications_received?: number
  verification_status?: NGOVerificationStatus
}

// Database type for Supabase client
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile
        Insert: Omit<UserProfile, 'created_at' | 'updated_at' | 'is_verified'> & {
          created_at?: string
          updated_at?: string
          is_verified?: boolean
        }
        Update: Partial<Omit<UserProfile, 'id' | 'created_at'>>
      }
      ngo_applications: {
        Row: NGOApplication
        Insert: Omit<NGOApplication, 'id' | 'created_at' | 'updated_at' | 'verification_status'> & {
          id?: string
          created_at?: string
          updated_at?: string
          verification_status?: NGOVerificationStatus
        }
        Update: Partial<Omit<NGOApplication, 'id' | 'created_at'>>
      }
      volunteer_opportunities: {
        Row: VolunteerOpportunity
        Insert: Omit<VolunteerOpportunity, 'id' | 'created_at' | 'updated_at' | 'volunteers_applied' | 'status' | 'volunteers_needed'> & {
          id?: string
          created_at?: string
          updated_at?: string
          volunteers_applied?: number
          status?: OpportunityStatus
          volunteers_needed?: number
        }
        Update: Partial<Omit<VolunteerOpportunity, 'id' | 'created_at'>>
      }
      volunteer_applications: {
        Row: VolunteerApplication
        Insert: Omit<VolunteerApplication, 'id' | 'applied_at' | 'status'> & {
          id?: string
          applied_at?: string
          status?: ApplicationStatus
        }
        Update: Partial<Omit<VolunteerApplication, 'id' | 'applied_at'>>
      }
      location_cache: {
        Row: LocationCache
        Insert: Omit<LocationCache, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<LocationCache, 'id' | 'created_at'>>
      }
    }
    Functions: {
      find_nearby_opportunities: {
        Args: {
          user_lat: number
          user_lng: number
          radius_km?: number
          category_filter?: string
          limit_count?: number
        }
        Returns: NearbyOpportunity[]
      }
      find_nearby_volunteers: {
        Args: {
          opportunity_id_param: string
          radius_km?: number
          limit_count?: number
        }
        Returns: NearbyVolunteer[]
      }
      get_user_stats: {
        Args: {
          user_id_param: string
        }
        Returns: UserStats
      }
      calculate_distance: {
        Args: {
          lat1: number
          lng1: number
          lat2: number
          lng2: number
        }
        Returns: number
      }
    }
  }
}
