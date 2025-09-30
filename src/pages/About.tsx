import React from 'react'
import { motion } from 'framer-motion'
import { MapPin, Heart, Award, Target, Lightbulb, Users, TrendingUp, Sparkles, Globe, Shield } from 'lucide-react'

const About: React.FC = () => {
  const stats = [
    { value: "500+", label: "Verified NGOs", icon: Shield },
    { value: "10,000+", label: "Active Volunteers", icon: Users },
    { value: "50+", label: "Cities Covered", icon: Globe },
    { value: "25,000+", label: "Hours Volunteered", icon: TrendingUp }
  ]

  const features = [
    {
      icon: MapPin,
      title: "Location-Based Matching",
      description: "Find opportunities near you using our advanced geolocation technology that connects volunteers with NGOs in their vicinity.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Award,
      title: "Verified Organizations",
      description: "All NGOs undergo a thorough verification process to ensure authenticity, transparency, and commitment to their cause.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Heart,
      title: "Meaningful Impact",
      description: "Track your volunteering journey, build meaningful relationships, and see the real impact of your contributions to society.",
      gradient: "from-orange-500 to-red-500"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-orange-50/30 to-white overflow-hidden pt-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-orange-600 via-pink-600 to-orange-700 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full filter blur-3xl animate-blob"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">About Us</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">About Mauka</h1>
            <p className="text-2xl text-orange-50">
              Empowering communities through meaningful volunteer connections
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-pink-500/10 rounded-3xl transform group-hover:scale-105 transition-transform duration-300"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl shadow-lg">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Our Mission</h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                To create a seamless platform that connects passionate volunteers with verified NGOs, 
                making social impact accessible and measurable. We believe that every person has the 
                power to make a difference, and location should never be a barrier to meaningful 
                community engagement.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl transform group-hover:scale-105 transition-transform duration-300"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <Lightbulb className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Our Vision</h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                To build the largest and most trusted volunteer network in India, where every 
                community has access to dedicated volunteers and every volunteer can find 
                opportunities that match their passion, skills, and availability.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-2xl p-12 mb-20 border border-gray-100"
        >
          <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-12">Impact by Numbers</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-100 to-pink-100 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-8 h-8 text-orange-600" />
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-2">{stat.value}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* How It Works */}
        <div className="mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-12"
          >
            How Mauka Works
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-300`}></div>
                
                <div className="relative">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl mb-6 shadow-lg`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Our Story */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-pink-50 rounded-3xl p-12"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200/30 rounded-full filter blur-3xl"></div>
          <div className="relative">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-8">Our Story</h2>
            <div className="space-y-6 text-lg text-gray-700">
              <p className="leading-relaxed">
                Mauka was born from a simple observation: while there are countless passionate 
                individuals wanting to volunteer and numerous NGOs needing help, connecting them 
                effectively remained a challenge.
              </p>
              <p className="leading-relaxed">
                Founded in 2023 by a team of social entrepreneurs and technology enthusiasts, 
                Mauka leverages technology to solve this connection problem. Our platform uses 
                location-based matching, comprehensive verification processes, and user-friendly 
                interfaces to make volunteering accessible to everyone.
              </p>
              <p className="leading-relaxed">
                Today, we're proud to be India's fastest-growing volunteer matching platform, 
                facilitating thousands of meaningful connections between volunteers and NGOs 
                across the country.
              </p>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

export default About