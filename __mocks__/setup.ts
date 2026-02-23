// Arquivo de configuração do Jest

// Mock do Alert do React Native
jest.mock("react-native", () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

// Mock do expo-file-system
jest.mock("expo-file-system", () => ({
  documentDirectory: "file:///document/directory/",
  downloadAsync: jest.fn().mockImplementation(async (url: string, uri: string) => ({
    uri,
    status: 200,
    headers: {},
    mimeType: "application/pdf",
  })),
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
  getInfoAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  copyAsync: jest.fn(),
  moveAsync: jest.fn(),
  readDirectoryAsync: jest.fn(),
}));

// Mock do expo-sharing
jest.mock("expo-sharing", () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock do módulo de banco de dados
jest.mock("../databases/database", () => ({
  getCredentials: jest.fn().mockReturnValue({
    accessToken: "mock-access-token",
    client: "mock-client",
    uid: "mock-uid",
  }),
  insertMTR: jest.fn(),
  updateMTRStatus: jest.fn(),
  getMTRById: jest.fn(),
}));

// Mock do expo-network
jest.mock("expo-network", () => ({
  getNetworkStateAsync: jest.fn().mockResolvedValue({
    isConnected: true,
    isInternetReachable: true,
    type: "wifi",
  }),
  getIpAddressAsync: jest.fn().mockResolvedValue("192.168.1.100"),
  getMacAddressAsync: jest.fn().mockResolvedValue("00:00:00:00:00:00"),
}));

// Mock do retrieveUserSession
jest.mock("../services/retrieveUserSession", () => ({
  retrieveUserSession: jest.fn().mockImplementation(async () => {
    console.log("retrieveUserSession: [MOCK] Starting...")
    return { 
      status: 200, 
      data: { email: "test@example.com", password: "password123" } 
    }
  }),
  retrieveDomain: jest.fn().mockImplementation(async () => {
    console.log("retrieveDomain: [MOCK] Starting...")
    return { 
      status: 200, 
      data: "http://mock-domain.com/api" 
    }
  }),
  getLocalIpAddress: jest.fn().mockResolvedValue("192.168.1.100"),
}));
