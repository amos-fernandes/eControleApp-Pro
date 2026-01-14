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

    const params = { ...filters }

    return await api
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
