// Mock para expo-network

export const getNetworkStateAsync = jest.fn().mockResolvedValue({
  isConnected: true,
  isInternetReachable: true,
  type: 'wifi',
})

export const getIpAddressAsync = jest.fn().mockResolvedValue('192.168.1.100')

export const getMacAddressAsync = jest.fn().mockResolvedValue('00:00:00:00:00:00')

export const getAirplaneModeAsync = jest.fn().mockResolvedValue(false)

export default {
  getNetworkStateAsync,
  getIpAddressAsync,
  getMacAddressAsync,
  getAirplaneModeAsync,
}
