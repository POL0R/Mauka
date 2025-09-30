import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, User, LogOut, MapPin } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Mauka</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/volunteer" 
              className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
            >
              For Volunteers
            </Link>
            <Link 
              to="/ngo" 
              className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
            >
              For NGOs
            </Link>
            <Link 
              to="/about" 
              className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/dashboard" 
                  className="flex items-center space-x-2 text-gray-700 hover:text-orange-600"
                >
                  <User className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
                {profile?.user_type === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="flex items-center space-x-2 text-gray-700 hover:text-orange-600"
                  >
                    <User className="w-5 h-5" />
                    <span>Admin</span>
                  </Link>
                )}
                <button 
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 text-gray-700 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-orange-600 font-medium"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="btn-primary"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/volunteer" 
                className="text-gray-700 hover:text-orange-600 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                For Volunteers
              </Link>
              <Link 
                to="/ngo" 
                className="text-gray-700 hover:text-orange-600 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                For NGOs
              </Link>
              <Link 
                to="/about" 
                className="text-gray-700 hover:text-orange-600 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="text-gray-700 hover:text-orange-600 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              
              <div className="pt-4 border-t border-gray-200">
                {user ? (
                  <div className="flex flex-col space-y-2">
                    <Link 
                      to="/dashboard" 
                      className="flex items-center space-x-2 text-gray-700 hover:text-orange-600 py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-5 h-5" />
                      <span>Dashboard</span>
                    </Link>
                    {profile?.user_type === 'admin' && (
                      <Link 
                        to="/admin" 
                        className="flex items-center space-x-2 text-gray-700 hover:text-orange-600 py-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="w-5 h-5" />
                        <span>Admin</span>
                      </Link>
                    )}
                    <button 
                      onClick={() => {
                        handleSignOut()
                        setIsMenuOpen(false)
                      }}
                      className="flex items-center space-x-2 text-gray-700 hover:text-red-600 py-2 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Link 
                      to="/login" 
                      className="text-gray-700 hover:text-orange-600 font-medium py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link 
                      to="/signup" 
                      className="btn-primary inline-block text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
