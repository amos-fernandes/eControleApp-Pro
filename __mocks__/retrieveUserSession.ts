import * as Network from 'expo-network'

export const retrieveUserSession = jest.fn().mockImplementation(async () => {
  console.log("retrieveUserSession: [MOCK] Starting...")
  return {
    status: 200,
    data: { email: "test@example.com", password: "password123" },
  }
})

export const retrieveDomain = jest.fn().mockImplementation(async () => {
  console.log("retrieveDomain: [MOCK] Starting...")
  return { 
    status: 200, 
    data: "http://mock-domain.com/api" 
  }
})

export const getLocalIpAddress = jest.fn().mockImplementation(async () => {
  const ipAddress = await Network.getIpAddressAsync()
  return ipAddress
})

export default {
  retrieveUserSession,
  retrieveDomain,
  getLocalIpAddress,
}
