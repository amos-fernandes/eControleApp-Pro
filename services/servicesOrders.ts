import api from "./connection"
import { retrieveDomain } from "./retrieveUserSession"
import { getRealm } from "../databases/realm"

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
  const realm = await getRealm()
  const URL = await retrieveDomain()

  try {
    if (!realm || typeof realm.objects !== "function") {
      console.warn("getServicesOrders: Realm not available (stub or missing)")
      throw new Error("LOCAL_DB_UNAVAILABLE")
    }

    const credentials: any = realm.objects("Credentials")[0] || null
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
  const realm = await getRealm()
  const URL = await retrieveDomain()
  console.log("id de entrada", id)

  try {
    if (!realm || typeof realm.objects !== "function") {
      console.warn("getServiceOrder: Realm not available (stub or missing)")
      throw new Error("LOCAL_DB_UNAVAILABLE")
    }

    const credentials: any = realm.objects("Credentials")[0] || null
    if (!credentials || !credentials.accessToken) {
      console.warn("getServiceOrder: No credentials found in local DB")
      throw new Error("NO_CREDENTIALS")
    }

    const params = {
      "access-token": credentials.accessToken,
      "client": credentials.client,
      "uid": credentials.uid,
    }
    console.log("params", params)
    console.log("URL", URL)
    console.log("antes da request")
    const response: any = await api.get(`${URL?.data}/service_orders/${id}`, {
      headers: {
        "Content-Type": "application/json",
        "access-token": credentials.accessToken,
        "client": credentials.client,
        "uid": credentials.uid,
      },
    })
    return response.data
  } catch (error: any) {
    console.log(error)
  }
}
