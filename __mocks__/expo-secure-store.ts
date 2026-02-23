// Mock para expo-secure-store

const store: Record<string, string> = {}

export default {
  setItemAsync: jest.fn().mockImplementation(async (key: string, value: string) => {
    store[key] = value
  }),
  getItemAsync: jest.fn().mockImplementation(async (key: string) => {
    return store[key] || null
  }),
  deleteItemAsync: jest.fn().mockImplementation(async (key: string) => {
    delete store[key]
  }),
  getAllKeysAsync: jest.fn().mockImplementation(async () => {
    return Object.keys(store)
  }),
  hasEnrolledBiometricAsync: jest.fn().mockResolvedValue(false),
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  requireAuthenticationAsync: jest.fn().mockResolvedValue({ success: false }),
}
