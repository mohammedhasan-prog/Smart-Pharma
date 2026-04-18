import api from './axiosClient'

export async function getMedicines() {
  const { data } = await api.get('/medicines')
  return Array.isArray(data) ? data : data?.medicines || data?.data || []
}

export async function createMedicine(payload) {
  const { data } = await api.post('/medicines', payload)
  return data
}

export async function updateMedicine(id, payload) {
  const { data } = await api.put(`/medicines/${id}`, payload)
  return data
}

export async function deleteMedicine(id) {
  const { data } = await api.delete(`/medicines/${id}`)
  return data
}
