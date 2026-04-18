import api from './axiosClient'

export async function sellMedicine(payload) {
  const { data } = await api.post('/sell', payload)
  return data
}
