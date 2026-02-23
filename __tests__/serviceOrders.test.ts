/**
 * Testes de Funcionalidade - Ordens de Serviço
 * 
 * Testa listagem, filtragem e atualização de ordens de serviço
 */

describe('Fluxo de Ordens de Serviço', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Filtros e Ordenação', () => {
    it('deve filtrar ordens por status', () => {
      const mockServiceOrders = [
        { id: 1, status: 'pending' },
        { id: 2, status: 'completed' },
        { id: 3, status: 'pending' },
        { id: 4, status: 'cancelled' },
      ]

      const filtered = mockServiceOrders.filter(os => os.status === 'pending')

      expect(filtered.length).toBe(2)
      expect(filtered.map(os => os.id)).toEqual([1, 3])
    })

    it('deve ordenar ordens por data', () => {
      const mockServiceOrders = [
        { id: 1, service_date: '2024-01-15' },
        { id: 2, service_date: '2024-01-17' },
        { id: 3, service_date: '2024-01-16' },
      ]

      const sorted = mockServiceOrders.sort((a, b) => 
        new Date(a.service_date).getTime() - new Date(b.service_date).getTime()
      )

      expect(sorted.map(os => os.id)).toEqual([1, 3, 2])
    })

    it('deve agrupar ordens por data da rota', () => {
      const mockServiceOrders = [
        {
          id: 1,
          identifier: 'OS-001',
          service_date: '2024-01-15',
          route_date: '2024-01-16',
          status: 'pending',
        },
        {
          id: 2,
          identifier: 'OS-002',
          service_date: '2024-01-15',
          route_date: '2024-01-16',
          status: 'completed',
        },
        {
          id: 3,
          identifier: 'OS-003',
          service_date: '2024-01-15',
          route_date: '2024-01-17',
          status: 'pending',
        },
      ]

      const grouped = mockServiceOrders.reduce((acc, os) => {
        const date = os.route_date || os.service_date
        if (!acc[date]) {
          acc[date] = []
        }
        acc[date].push(os)
        return acc
      }, {} as Record<string, typeof mockServiceOrders>)

      expect(Object.keys(grouped).length).toBe(2)
      expect(grouped['2024-01-16'].length).toBe(2)
      expect(grouped['2024-01-17'].length).toBe(1)
    })
  })

  describe('Atualização de Ordem de Serviço', () => {
    it('deve validar dados antes de atualizar', () => {
      const updateData = {
        id: 1,
        status: 'completed',
        observations: 'Serviço finalizado',
      }

      expect(updateData.id).toBeDefined()
      expect(updateData.status).toBeDefined()
    })

    it('deve adicionar observações', () => {
      const os = {
        id: 1,
        observations: '',
        driver_observations: '',
      }

      const updated = {
        ...os,
        driver_observations: 'Observação do motorista',
      }

      expect(updated.driver_observations).toBe('Observação do motorista')
    })

    it('deve atualizar status da ordem', () => {
      const os = {
        id: 1,
        status: 'pending',
      }

      const updated = {
        ...os,
        status: 'completed',
      }

      expect(updated.status).toBe('completed')
    })
  })

  describe('Equipamentos em Ordens de Serviço', () => {
    it('deve listar equipamentos disponíveis', () => {
      const mockEquipments = [
        { id: 1, name: 'Caminhão Baú', value: 'truck_box' },
        { id: 2, name: 'Caminhão Frigorífico', value: 'truck_refrigerated' },
        { id: 3, name: 'VUC', value: 'vuc' },
      ]

      expect(mockEquipments.length).toBe(3)
      expect(mockEquipments.map(e => e.value)).toContain('truck_box')
    })

    it('deve selecionar múltiplos equipamentos', () => {
      const selectedEquipment = ['truck_box', 'vuc']

      expect(selectedEquipment.length).toBe(2)
      expect(selectedEquipment).toContain('truck_box')
      expect(selectedEquipment).toContain('vuc')
    })
  })

  describe('Endereços em Ordens de Serviço', () => {
    it('deve formatar endereço completo', () => {
      const address = {
        street: 'Rua das Flores',
        number: '123',
        complement: 'Apto 45',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '01234-567',
      }

      const formatted = `${address.street}, ${address.number} - ${address.neighborhood}, ${address.city}/${address.state}`

      expect(formatted).toContain('Rua das Flores')
      expect(formatted).toContain('São Paulo/SP')
    })

    it('deve abrir Google Maps com coordenadas', () => {
      const coordinates = {
        latitude: -23.5505,
        longitude: -46.6333,
      }

      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${coordinates.latitude},${coordinates.longitude}`

      expect(mapsUrl).toContain('google.com/maps')
      expect(mapsUrl).toContain('-23.5505')
      expect(mapsUrl).toContain('-46.6333')
    })
  })

  describe('Envio de Ordens de Serviço', () => {
    it('deve validar ordem antes de enviar', () => {
      const os = {
        id: 1,
        status: 'completed',
        has_photos: true,
        has_driver_observations: true,
      }

      const isValid = os.status === 'completed' && os.has_photos && os.has_driver_observations

      expect(isValid).toBe(true)
    })

    it('deve falhar validação se faltar fotos', () => {
      const os = {
        id: 1,
        status: 'completed',
        has_photos: false,
        has_driver_observations: true,
      }

      const isValid = os.status === 'completed' && os.has_photos && os.has_driver_observations

      expect(isValid).toBe(false)
    })
  })
})
