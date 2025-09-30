import React from 'react'
import { MapPin, Heart, Award, Target, Lightbulb } from 'lucide-react'

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Mauka</h1>
          <p className="text-xl text-orange-100">
            Empowering communities through meaningful volunteer connections
          </p>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <Target className="w-8 h-8 text-orange-600" />
              <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
            </div>
            <p className="text-lg text-gray-600 leading-relaxed">
              To create a seamless platform that connects passionate volunteers with verified NGOs, 
              making social impact accessible and measurable. We believe that every person has the 
              power to make a difference, and location should never be a barrier to meaningful 
              community engagement.
            </p>
          </div>
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <Lightbulb className="w-8 h-8 text-orange-600" />
              <h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
            </div>
            <p className="text-lg text-gray-600 leading-relaxed">
              To build the largest and most trusted volunteer network in India, where every 
              community has access to dedicated volunteers and every volunteer can find 
              opportunities that match their passion, skills, and availability.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Impact by Numbers</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">500+</div>
              <div className="text-gray-600">Verified NGOs</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">2,000+</div>
              <div className="text-gray-600">Active Volunteers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">50+</div>
              <div className="text-gray-600">Cities Covered</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">10,000+</div>
              <div className="text-gray-600">Hours Volunteered</div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">How Mauka Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <MapPin className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Location-Based Matching</h3>
              <p className="text-gray-600">
                Find opportunities near you using our advanced geolocation technology that connects 
                volunteers with NGOs in their vicinity.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <Award className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Verified Organizations</h3>
              <p className="text-gray-600">
                All NGOs undergo a thorough verification process to ensure authenticity, 
                transparency, and commitment to their cause.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Meaningful Impact</h3>
              <p className="text-gray-600">
                Track your volunteering journey, build meaningful relationships, and see the 
                real impact of your contributions to society.
              </p>
            </div>
          </div>
        </div>

        {/* Our Story */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Mauka was born from a simple observation: while there are countless passionate 
              individuals wanting to volunteer and numerous NGOs needing help, connecting them 
              effectively remained a challenge.
            </p>
            <p>
              Founded in 2023 by a team of social entrepreneurs and technology enthusiasts, 
              Mauka leverages technology to solve this connection problem. Our platform uses 
              location-based matching, comprehensive verification processes, and user-friendly 
              interfaces to make volunteering accessible to everyone.
            </p>
            <p>
              Today, we're proud to be India's fastest-growing volunteer matching platform, 
              facilitating thousands of meaningful connections between volunteers and NGOs 
              across the country.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
