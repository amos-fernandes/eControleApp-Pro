import axios from 'axios'

// TODO: Replace with actual API base URL
const API_BASE_URL = 'https://api.example.com'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor for authentication if needed
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    // const token = await GetDataFromSecureStore('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error)
  }
)

export default api
