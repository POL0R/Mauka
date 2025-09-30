import React from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, Users, MapPin, Award, ArrowRight } from 'lucide-react'

const NGO: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold">Partner with Mauka</h1>
            <p className="text-xl text-orange-100 max-w-2xl mx-auto">
              Connect with passionate volunteers, expand your impact, and make a real difference in your community
            </p>
            <div className="pt-4">
              <Link
                to="/signup"
                className="inline-flex items-center px-8 py-4 bg-white text-orange-600 rounded-lg text-lg font-semibold hover:bg-orange-50 transition-colors shadow-lg"
              >
                Register Your NGO
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Partner with Mauka?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Find Dedicated Volunteers</h3>
              <p className="text-gray-600">
                Connect with passionate volunteers who match your organization's needs and values
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <MapPin className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Location-Based Matching</h3>
              <p className="text-gray-600">
                Reach volunteers in your local area who can physically participate in your activities
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Verified Platform</h3>
              <p className="text-gray-600">
                Join a trusted platform where all NGOs are verified for authenticity and credibility
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What You Can Do
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Post Opportunities</h3>
                  <p className="text-gray-600">
                    Create and manage volunteer opportunities. Set requirements, locations, and schedules that work for your organization.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Review Applications</h3>
                  <p className="text-gray-600">
                    Review volunteer profiles, skills, and applications. Accept or reject candidates based on your needs.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Reach Local Volunteers</h3>
                  <p className="text-gray-600">
                    Our location-based matching ensures you connect with volunteers in your area who can participate effectively.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Build Your Community</h3>
                  <p className="text-gray-600">
                    Create a network of reliable volunteers who are passionate about your cause and mission.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-orange-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Register your NGO today and start connecting with volunteers in your area
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center px-8 py-4 bg-white text-orange-600 rounded-lg text-lg font-semibold hover:bg-orange-50 transition-colors shadow-lg"
          >
            Register Your NGO Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
          <p className="mt-4 text-orange-100 text-sm">
            Already have an account? <Link to="/login" className="underline hover:text-white">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default NGO
