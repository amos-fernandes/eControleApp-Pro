import api from "./connection"
import { retrieveDomain } from "./retrieveUserSession"
import { getCredentials } from "../databases/database"

interface FilterServiceOrderState {
  filters: {
    status: string
    so_type: string
    start_date?: string
    end_date?: string
    voyage: string
  }
}

export const getServicesOrders = async ({ filters }: FilterServiceOrderState) => {
  const credentials = await getCredentials()
  const URL = await retrieveDomain()

  try {
    if (!credentials || !credentials.accessToken) {
      console.warn("getServicesOrders: No credentials found in local DB")
      throw new Error("NO_CREDENTIALS")
    }
    const params = {
      ...filters,
    }

    return await api
      .get(`${URL?.data}/service_orders`, {
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
  } catch (error: any) {
    throw error
  }
}

export const getServiceOrder = async (id: string) => {
  const credentials = await getCredentials()
  const URL = await retrieveDomain()
  console.log("id de entrada", id)

  try {
    if (!credentials || !credentials.accessToken) {
      console.warn("getServiceOrder: No credentials found in local DB")
      throw new Error("NO_CREDENTIALS")
    }

    const headers = {
      "Content-Type": "application/json",
      "access-token": credentials.accessToken,
      client: credentials.client,
      uid: credentials.uid,
    }
    console.log('getServiceOrder: request headers', headers)
    try {
      const response: any = await api.get(`${URL?.data}/service_orders/${id}`, { headers })
      console.log('getServiceOrder: response status', response.status)
      return response.data
    } catch (err: any) {
      console.log('getServiceOrder error response status', err?.response?.status)
      console.log('getServiceOrder error response data', err?.response?.data)
      throw err
    }
  } catch (error: any) {
    console.log(error)
    throw error
  }
}
