import axios from 'axios'

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'

const api = axios.create({
  baseURL: configuredBaseUrl,
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pharmacyAuthToken')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status ?? 0
    const responseData = error.response?.data

    const message =
      responseData?.message ||
      responseData?.error ||
      (status === 0
        ? 'Unable to connect to backend. Check API server and VITE_API_BASE_URL.'
        : 'Unexpected server error')

    return Promise.reject({
      status,
      message,
      data: responseData,
      originalError: error,
    })
  }
)

export default api
