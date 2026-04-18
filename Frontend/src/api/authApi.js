import api from './axiosClient'

export async function loginUser(payload) {
  const { data } = await api.post('/auth/login', payload)
  return data
}

export async function registerUser(payload) {
  const { data } = await api.post('/auth/register', payload)
  return data
}

export function extractAuthToken(responseData) {
  return (
    responseData?.token ||
    responseData?.accessToken ||
    responseData?.jwt ||
    responseData?.data?.token ||
    ''
  )
}

export function extractUserRole(responseData) {
  return (
    responseData?.role ||
    responseData?.user?.role ||
    responseData?.data?.role ||
    responseData?.data?.user?.role ||
    ''
  )
}
