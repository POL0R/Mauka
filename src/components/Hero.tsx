import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, Users, Heart, Award } from 'lucide-react'

const Hero: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-orange-50 via-white to-orange-50 min-h-screen">
      {/* Main Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Find Your 
                <span className="text-orange-600 block">Perfect Volunteer</span>
                Opportunity
              </h1>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                Connect with verified NGOs near you and make a meaningful impact in your community. 
                Discover volunteer opportunities that match your skills, interests, and location.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/volunteer"
                className="btn-primary text-lg px-8 py-4 flex items-center justify-center space-x-2 group"
              >
                <span>Start Volunteering</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/ngo"
                className="btn-secondary text-lg px-8 py-4 flex items-center justify-center space-x-2"
              >
                <span>Register Your NGO</span>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-orange-600">500+</div>
                <div className="text-sm md:text-base text-gray-600">Verified NGOs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-orange-600">2000+</div>
                <div className="text-sm md:text-base text-gray-600">Active Volunteers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-orange-600">50+</div>
                <div className="text-sm md:text-base text-gray-600">Cities</div>
              </div>
            </div>
          </div>

          {/* Right Content - Image/Illustration */}
          <div className="relative">
            <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl p-8 lg:p-12">
              <div className="space-y-6">
                {/* Volunteer Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-md">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
                        <Heart className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Healthcare</div>
                        <div className="text-xs text-gray-500">15 km away</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-md">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Education</div>
                        <div className="text-xs text-gray-500">8 km away</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Indicator */}
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-6 h-6 text-orange-600" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Your Location</div>
                      <div className="text-xs text-gray-500">Mumbai, Maharashtra</div>
                    </div>
                  </div>
                </div>

                {/* Community Stats */}
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <div className="flex items-center space-x-3">
                    <Users className="w-6 h-6 text-blue-600" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Active Community</div>
                      <div className="text-xs text-gray-500">Join 150+ volunteers nearby</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-orange-400 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-blue-400 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              How Mauka Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform makes it easy to find and participate in meaningful volunteer opportunities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <MapPin className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">1. Set Your Location</h3>
              <p className="text-gray-600">
                Tell us where you are and how far you're willing to travel for volunteer opportunities
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">2. Choose Your Cause</h3>
              <p className="text-gray-600">
                Browse verified NGOs and opportunities that match your interests and skills
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">3. Make an Impact</h3>
              <p className="text-gray-600">
                Apply to opportunities and start making a meaningful difference in your community
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
