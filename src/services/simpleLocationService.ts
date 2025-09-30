// Simple location service that provides common Indian cities
// This is a fallback when IP-based detection fails

export const getCommonIndianCities = () => [
  { city: 'Mumbai', state: 'Maharashtra' },
  { city: 'Delhi', state: 'Delhi' },
  { city: 'Bangalore', state: 'Karnataka' },
  { city: 'Hyderabad', state: 'Telangana' },
  { city: 'Chennai', state: 'Tamil Nadu' },
  { city: 'Kolkata', state: 'West Bengal' },
  { city: 'Pune', state: 'Maharashtra' },
  { city: 'Ahmedabad', state: 'Gujarat' },
  { city: 'Jaipur', state: 'Rajasthan' },
  { city: 'Surat', state: 'Gujarat' },
  { city: 'Lucknow', state: 'Uttar Pradesh' },
  { city: 'Kanpur', state: 'Uttar Pradesh' },
  { city: 'Nagpur', state: 'Maharashtra' },
  { city: 'Indore', state: 'Madhya Pradesh' },
  { city: 'Thane', state: 'Maharashtra' },
  { city: 'Bhopal', state: 'Madhya Pradesh' },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh' },
  { city: 'Pimpri-Chinchwad', state: 'Maharashtra' },
  { city: 'Patna', state: 'Bihar' },
  { city: 'Vadodara', state: 'Gujarat' }
]

export const getDefaultLocation = () => ({
  city: 'Mumbai',
  state: 'Maharashtra',
  country: 'India',
  latitude: 19.0760,
  longitude: 72.8777
})

// Function to get a random city (for demo purposes)
export const getRandomIndianCity = () => {
  const cities = getCommonIndianCities()
  const randomIndex = Math.floor(Math.random() * cities.length)
  const selectedCity = cities[randomIndex]
  
  return {
    city: selectedCity.city,
    state: selectedCity.state,
    country: 'India',
    latitude: 0, // You can add actual coordinates if needed
    longitude: 0
  }
}
