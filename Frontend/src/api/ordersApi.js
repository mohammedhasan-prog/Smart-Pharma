import api from './axiosClient'

export async function getOrders() {
  const { data } = await api.get('/orders')
  return Array.isArray(data) ? data : data?.orders || data?.data || []
}

export async function getMyOrders() {
  const { data } = await api.get('/orders/my-orders')
  return Array.isArray(data) ? data : data?.orders || data?.data || []
}

export async function acceptOrder(id) {
  const { data } = await api.put(`/orders/${id}/approve`)
  return data
}

export async function deliverOrder(id) {
  const { data } = await api.put(`/orders/${id}/deliver`)
  return data
}
