import api from './axiosClient'

export async function getAllUsers() {
  const { data } = await api.get('/wholesaler/users')
  return data?.users || []
}

export async function getCompletedOrdersBySeller() {
  const { data } = await api.get('/wholesaler/sold-medicines')
  return {
    totalDeliveredOrders: data?.totalDeliveredOrders || 0,
    totalSellers: data?.totalSellers || 0,
    sellerWiseSales: data?.sellerWiseSales || [],
  }
}
