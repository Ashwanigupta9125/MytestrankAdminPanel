import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import axios from 'axios'

// List of endpoints that do NOT require JWT
const publicEndpoints = [
  '/authenticate',
  '/banner/getBanners',
  '/user/signup',
  '/fetch/allCourseMainPage',
  '/plans/allPlans',
  '/',
  '/home'
]

// Helper to check if URL matches a public endpoint (exact match or ends with)
function isPublicEndpoint(url) {
  try {
    // Handles absolute URLs
    const path = new URL(url, window.location.origin).pathname
    return publicEndpoints.some(endpoint => path === endpoint || path.endsWith(endpoint))
  } catch {
    // Handles relative URLs
    return publicEndpoints.some(endpoint => url === endpoint || url.endsWith(endpoint))
  }
}

// Axios request interceptor
axios.interceptors.request.use(config => {
  if (!isPublicEndpoint(config.url)) {
    const token = localStorage.getItem('jwtToken')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
      console.log('JWT added to request:', config.url, config.headers['Authorization'])
    } else {
      console.log('No JWT token found for:', config.url)
    }
  } else {
    console.log('Public endpoint, no JWT sent:', config.url)
  }
  return config
}, error => Promise.reject(error))

console.log(localStorage.getItem('jwtToken'))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
