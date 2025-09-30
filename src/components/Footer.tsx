import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Mail, Phone, Twitter, Facebook, Instagram, Linkedin } from 'lucide-react'

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Mauka</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Connecting passionate volunteers with verified NGOs across India. 
              Making social impact accessible through location-based matching.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/volunteer" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Find Opportunities
                </Link>
              </li>
              <li>
                <Link to="/ngo" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Register NGO
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-orange-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-orange-400 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/safety" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Safety Guidelines
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-orange-400" />
                <span className="text-gray-300">projectmaukajpis@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-orange-400" />
                <span className="text-gray-300">+91 XXXXX XXXXX</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-orange-400 mt-0.5" />
                <span className="text-gray-300">
                  India<br />
                  Connecting communities nationwide
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Mauka Platform. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm">
              Built with ❤️ for creating positive social impact across India.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
