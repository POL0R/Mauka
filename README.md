# Mauka Platform - Volunteer Matching Platform

## 🚀 Overview

Mauka is a location-based volunteer matching platform that connects passionate student volunteers with verified NGOs across India. The platform uses real-time geolocation and distance-based matching to help volunteers find meaningful opportunities near them.

## ✨ Key Features

* **Location-Based Matching**: Find NGOs and volunteer opportunities within your preferred radius
* **Role-Based Dashboards**: Separate interfaces for volunteers, NGOs, and admins
* **NGO Verification System**: Comprehensive verification process with document upload
* **Real-Time Applications**: Apply to opportunities and track application status
* **Interactive Maps**: Visualize nearby opportunities on interactive maps
* **Responsive Design**: Mobile-first design with orange+white theme

## 🛠️ Tech Stack

### Frontend
* **React 18** with TypeScript
* **Tailwind CSS v4** with Vite plugin for styling
* **React Router** for navigation
* **Supabase** for authentication and database
* **Mapbox** for maps and geocoding
* **Lucide React** for icons
* **Vite** for build tooling

### Backend
* **Supabase** (PostgreSQL) for database and authentication
* **PostGIS** for geospatial queries
* **Mapbox Geocoding API** for address conversion
* **Row Level Security (RLS)** for data protection

## 📋 Prerequisites

* Node.js 18+ and npm
* Supabase account
* Mapbox account

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Mapbox Configuration  
VITE_MAPBOX_ACCESS_TOKEN=your-mapbox-token
```

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd mauka
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project
2. Enable PostGIS extension in SQL Editor:
   ```sql
   CREATE EXTENSION IF NOT EXISTS "postgis";
   ```
3. Run the migration files in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_utility_functions.sql`
4. Set up the storage bucket for NGO documents
5. Configure your environment variables

### 3. Set Up Mapbox

1. Create a Mapbox account
2. Get your access token
3. Add it to your `.env` file

### 4. Run the Application

```bash
npm run dev
```

This will start the frontend at: http://localhost:5173

## 📊 Database Schema

### Core Tables

* **user_profiles**: Extended user information with location data
* **ngo_applications**: NGO verification applications with document uploads
* **volunteer_opportunities**: Volunteer opportunity postings by verified NGOs
* **volunteer_applications**: Volunteer applications to NGO postings
* **location_cache**: Geocoded location cache for performance

### Key Features

* **PostGIS Integration**: Efficient geospatial queries using `GEOGRAPHY` type
* **Automated Triggers**: Auto-update geolocation from lat/lng coordinates
* **Row Level Security**: Secure data access based on user roles
* **Custom Functions**: Database functions for nearby searches and stats

## 🗺️ Location Features

### Geocoding
* Automatic address-to-coordinates conversion using Mapbox
* Cached geocoding results for performance
* Support for Indian addresses with city/state extraction

### Distance Calculation
* PostGIS `ST_Distance` for accurate distance calculation
* 2dsphere indexes for efficient geospatial queries
* Configurable search radius (5km to 100km)

### Map Integration
* Interactive maps showing nearby opportunities
* Real-time location updates
* Custom markers for NGOs and volunteers

## 👥 User Roles

### Volunteers
* Browse nearby NGO opportunities
* Apply to volunteer positions
* Track application status
* View volunteering history

### NGOs
* Submit verification applications with documents
* Create and manage volunteer postings (after verification)
* Review and manage volunteer applications
* Track active volunteers

### Admins
* Review NGO verification applications
* Approve/reject NGO registrations
* Monitor platform statistics

## 🔐 Security Features

* **Row Level Security (RLS)**: Supabase RLS policies for data protection
* **File Upload Security**: Secure document upload with type and size validation
* **Authentication**: JWT-based authentication with Supabase
* **Role-Based Access**: Different permissions for volunteers, NGOs, and admins

## 🎨 Design System

### Color Palette
* **Primary**: Orange (#ea580c) with white
* **Secondary**: Various orange shades (50-900)
* **Neutral**: Gray scale for text and backgrounds

### Components
* Consistent button styles with orange theme
* Form inputs with orange focus states
* Cards with subtle shadows and hover effects
* Mobile-responsive navigation

## 🧪 Testing

### Manual Testing
1. Sign up as a volunteer and complete profile
2. Sign up as an NGO and submit verification
3. Admin approves NGO verification
4. NGO creates volunteer postings
5. Volunteer applies to nearby opportunities

### Location Testing
1. Set your location in profile
2. Create postings with different addresses
3. Verify distance calculations are accurate
4. Test radius filtering

## 🚀 Deployment

### Frontend (Netlify/Vercel)
```bash
npm run build
# Deploy the dist/ folder
```

### Database (Supabase)
1. Set up production Supabase project
2. Run migrations in production
3. Configure environment variables
4. Set up storage buckets and policies

## 🔧 Development

### Adding New Features
1. Create new components in `src/components/`
2. Add new pages in `src/pages/`
3. Update routes in `src/App.tsx`
4. Add database functions in migration files

### Database Changes
1. Create new Supabase migrations
2. Update TypeScript types in `src/types/database.ts`
3. Update service functions in `src/services/supabaseService.ts`
4. Run migrations in development and production

## 📞 Support

For issues or questions:
* Email: projectmaukajpis@gmail.com
* Check the console logs for detailed error messages
* Ensure all environment variables are configured correctly

## 📄 License

MIT License - see LICENSE file for details.

---

Built with ❤️ for creating positive social impact across India.