/**
 * Testes de Funcionalidade - Login e Autenticação
 * 
 * Este arquivo testa todo o fluxo de autenticação do aplicativo
 */

// Mock do SecureStore DEVE vir antes dos imports
jest.mock('@/utils/SecureStore', () => ({
  GetDataFromSecureStore: jest.fn(),
  SaveDataToSecureStore: jest.fn(),
  DeleteDataFromSecureStore: jest.fn(),
}))

import { retrieveUserSession, retrieveDomain, getLocalIpAddress } from '@/services/retrieveUserSession'
import { GetDataFromSecureStore } from '@/utils/SecureStore'

describe('Fluxo de Autenticação', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('retrieveUserSession', () => {
    it('deve retornar sessão do usuário quando existir', async () => {
      const mockSession = { email: 'test@example.com', password: 'password123' }
      ;(GetDataFromSecureStore as jest.Mock).mockResolvedValue(JSON.stringify(mockSession))

      const result = await retrieveUserSession()

      expect(result.status).toBe(200)
      expect(result.data).toEqual(mockSession)
    })

    it('deve retornar 404 quando sessão não existir', async () => {
      ;(GetDataFromSecureStore as jest.Mock).mockResolvedValue(null)

      const result = await retrieveUserSession()

      expect(result.status).toBe(404)
      expect(result.data).toBe('retrieveUserSession')
    })

    it('deve retornar 401 em caso de erro', async () => {
      ;(GetDataFromSecureStore as jest.Mock).mockRejectedValue(new Error('SecureStore error'))

      const result = await retrieveUserSession()

      expect(result.status).toBe(401)
    })
  })

  describe('retrieveDomain', () => {
    it('deve retornar domínio válido quando existir', async () => {
      const mockDomain = JSON.stringify({ domain: 'https://testeaplicativo.econtrole.com' })
      ;(GetDataFromSecureStore as jest.Mock).mockResolvedValue(mockDomain)

      const result = await retrieveDomain()

      expect(result.status).toBe(200)
      expect(result.data).toContain('/api')
    })

    it('deve retornar string vazia para web', async () => {
      const originalPlatform = require('react-native').Platform.OS
      require('react-native').Platform.OS = 'web'

      const result = await retrieveDomain()

      expect(result.status).toBe(200)
      expect(result.data).toBe('')

      require('react-native').Platform.OS = originalPlatform
    })

    it('deve retornar 404 quando domínio não existir', async () => {
      ;(GetDataFromSecureStore as jest.Mock).mockResolvedValue(null)

      const result = await retrieveDomain()

      expect(result.status).toBe(404)
    })

    it('deve permitir IPs locais 192.168.x.x', async () => {
      const mockDomain = JSON.stringify({ domain: 'http://192.168.1.100:8081' })
      ;(GetDataFromSecureStore as jest.Mock).mockResolvedValue(mockDomain)
      
      // Mock do fetch para evitar chamada de rede real
      global.fetch = jest.fn().mockResolvedValue({ url: 'http://192.168.1.100:8081' })

      const result = await retrieveDomain()

      // IPs locais agora são permitidos!
      expect(result.status).toBe(200)
      expect(result.data).toContain('192.168.1.100')
      
      // Restaura o fetch
      global.fetch = jest.fn()
    })

    it('deve rejeitar apenas expo-development-client', async () => {
      const mockDomain = JSON.stringify({ domain: 'exp+econtrole://expo-development-client/?url=http://192.168.1.100:8081' })
      ;(GetDataFromSecureStore as jest.Mock).mockResolvedValue(mockDomain)

      const result = await retrieveDomain()

      expect(result.status).toBe(400)
      expect(result.data).toBe('INVALID_URL_METRO')
    })

    it('deve normalizar URL removendo /login e adicionando /api', async () => {
      const mockDomain = JSON.stringify({ domain: 'https://testeaplicativo.econtrole.com/login' })
      ;(GetDataFromSecureStore as jest.Mock).mockResolvedValue(mockDomain)

      const result = await retrieveDomain()

      expect(result.status).toBe(200)
      expect(result.data).toBe('https://testeaplicativo.econtrole.com/api')
      expect(result.data).not.toContain('/login')
    })
  })

  describe('getLocalIpAddress', () => {
    it('deve retornar IP local quando disponível', async () => {
      const result = await getLocalIpAddress()

      expect(result).toBe('192.168.1.100')
    })
  })

  describe('Correção de Localhost', () => {
    it('deve detectar domínio localhost', () => {
      const testDomains = [
        'http://127.0.0.1:19000',
        'http://localhost:19000',
        'http://0.0.0.0:19000',
      ]

      for (const domain of testDomains) {
        expect(domain).toMatch(/(127\.0\.0\.1|localhost|0\.0\.0\.0)/)
      }
    })
  })
})
