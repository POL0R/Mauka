import React, { useState } from 'react'
import { Mail, Phone, MapPin, Send, MessageSquare, HelpCircle, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    type: 'general'
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Save message to database
      const { error: dbError } = await supabase
        .from('contact_messages')
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          subject: formData.subject,
          message: formData.message,
          status: 'unread'
        } as any)

      if (dbError) throw dbError

      // Show success message
      setSuccess(true)
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        type: 'general'
      })

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      console.error('Error submitting contact form:', err)
      setError('Failed to send message. Please try again or email us directly.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-orange-100">
            We're here to help and answer any questions you might have
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
              <p className="text-gray-600 mb-6">
                Have questions about volunteering, NGO registration, or need technical support? 
                We're here to help you make a positive impact.
              </p>
            </div>

            {/* Contact Methods */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Email Us</h3>
                  <p className="text-gray-600">projectmaukajpis@gmail.com</p>
                  <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Call Us</h3>
                  <p className="text-gray-600">+91 XXXXX XXXXX</p>
                  <p className="text-sm text-gray-500">Mon-Fri, 9:00 AM - 6:00 PM IST</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Visit Us</h3>
                  <p className="text-gray-600">India</p>
                  <p className="text-sm text-gray-500">Connecting communities nationwide</p>
                </div>
              </div>
            </div>

            {/* FAQ Link */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <HelpCircle className="w-6 h-6 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-lg font-semibold text-blue-900 mb-2">Need Quick Answers?</h4>
                  <p className="text-blue-800 text-sm mb-3">
                    Check out our FAQ section for instant answers to common questions.
                  </p>
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    View FAQ →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <MessageSquare className="w-6 h-6 text-orange-600" />
                <h2 className="text-2xl font-bold text-gray-900">Send us a Message</h2>
              </div>

              {/* Success Message */}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <p className="text-green-800">Message sent successfully! We'll get back to you soon.</p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inquiry Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="general">General Inquiry</option>
                    <option value="volunteer">Volunteer Support</option>
                    <option value="ngo">NGO Registration</option>
                    <option value="technical">Technical Support</option>
                    <option value="partnership">Partnership</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Brief description of your inquiry"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    className="input-field"
                    placeholder="Please provide details about your inquiry..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                  <span>{loading ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Additional Support */}
        <div className="mt-16 bg-orange-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
            Other Ways to Connect
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Volunteer Support</h3>
              <p className="text-gray-600 text-sm">
                Questions about finding opportunities, applying to NGOs, or managing your volunteer profile
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">NGO Support</h3>
              <p className="text-gray-600 text-sm">
                Help with registration, verification process, posting opportunities, or managing applications
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Technical Support</h3>
              <p className="text-gray-600 text-sm">
                Issues with the platform, account problems, or feature requests and bug reports
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
