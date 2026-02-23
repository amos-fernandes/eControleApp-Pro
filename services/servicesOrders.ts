import api from "./connection"
import { retrieveDomain } from "./retrieveUserSession"
import { getCredentials as getSQLiteCredentials } from "../databases/database"

interface FilterServiceOrderState {
  filters: {
    status: string
    so_type: string
    start_date?: string
    end_date?: string
    voyage: string
    route_name?: string
  }
}
export const getServicesOrders = async ({ filters }: FilterServiceOrderState) => {
  const URL = await retrieveDomain()

  try {
    const credentials: any = getSQLiteCredentials()
    if (!credentials || !credentials.accessToken) {
      console.warn("getServicesOrders: No credentials found in local DB")
      throw new Error("NO_CREDENTIALS")
    }

    if (!URL || URL.status !== 200 || !URL.data) {
      throw new Error("INVALID_DOMAIN")
    }

    // Construo params apenas com filtros válidos (não envia 'all' ou vazio)
    const params: any = {}
    
    if (filters.status && filters.status !== 'all') {
      params.status = filters.status
    }
    
    if (filters.so_type && filters.so_type !== 'all') {
      params.so_type = filters.so_type
    }
    
    if (filters.voyage && filters.voyage !== 'all') {
      params.voyage = filters.voyage
    }
    
    if (filters.start_date) {
      params.start_date = filters.start_date
    }
    
    if (filters.end_date) {
      params.end_date = filters.end_date
    }
    
    if (filters.route_name && filters.route_name.trim() !== '') {
      params.route_name = filters.route_name.trim()
    }

    console.log("📊 Filtros sendo enviados:", params)

    const response = await api
      .get(`${URL.data}/service_orders`, {
        params,
        headers: {
          "Content-Type": "application/json",
          "access-token": credentials.accessToken,
          "client": credentials.client,
          "uid": credentials.uid,
        },
      })
      .catch((error) => {
        console.log("error", error)
        throw error
      })

    console.log("getServicesOrders response:", response)
    console.log("getServicesOrders response.data:", response.data)
    console.log("getServicesOrders response.data type:", typeof response.data)
    console.log("getServicesOrders response.data keys:", response.data ? Object.keys(response.data) : "no data")

    return response.data
  } catch (error: any) {
    throw error
  }
}
export const getServiceOrder = async (id: string) => {
  const URL = await retrieveDomain()
  console.log("id de entrada", id)

  try {
    const credentials: any = getSQLiteCredentials()
    if (!credentials || !credentials.accessToken) {
      console.warn("getServiceOrder: No credentials found in local DB")
      throw new Error("NO_CREDENTIALS")
    }

    if (!URL || URL.status !== 200 || !URL.data) {
      throw new Error("INVALID_DOMAIN")
    }

    const response: any = await api.get(`${URL.data}/service_orders/${id}`)
    return response.data
  } catch (error: any) {
    console.log(error)
  }
}
