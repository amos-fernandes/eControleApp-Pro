import api from "./connection"
import reconnect from "./reconnect"
import { retrieveDomain } from "./retrieveUserSession"
import { getRealm } from "../databases/realm"

export const getEquipamentsLeft = async (customer_id: string, stock: boolean) => {
  const realm = await getRealm()
  const URL = await retrieveDomain()
  try {
    const credentials: any = realm.objects("Credentials")[0]
    const params = {
      "access-token": credentials.accessToken,
      "client": credentials.client,
      "uid": credentials.uid,
      customer_id,
      "in_stock": stock,
    }

    const response = await api.get(`${URL?.data}/operations/equipment`, {
      params,
    })
    return response.data

    if (response.data) {
      const equipaments = realm.objects("EquipamentLeft")
      realm.write(() => {
        if (equipaments.length !== response.data.items?.length) {
          realm.delete(equipaments)
          response.data.items.map((item: any) => {
            realm.create("EquipamentLeft", {
              id: item.id,
              equipment_type: item.equipment_type,
              current_customer: item.current_customer,
              created_at: new Date(),
            })
          })
        }
      })
    }

    return response.data
  } catch (error: any) {
    console.log(error)
    reconnect()
  } finally {
    // realm.close();
  }
}

export const getEquipamentsCollected = async (customer_id: string, stock: boolean) => {
  const realm = await getRealm()
  const URL = await retrieveDomain()
  try {
    const credentials: any = realm.objects("Credentials")[0]
    const params = {
      "access-token": credentials.accessToken,
      "client": credentials.client,
      "uid": credentials.uid,
      customer_id,
      "in_stock": stock,
    }

    const response = await api.get(`${URL?.data}/operations/equipment`, {
      params,
    })
    if (response.data) {
      const equipaments = realm.objects("EquipamentCollected")
      realm.write(() => {
        if (equipaments.length !== response.data.items?.length) {
          realm.delete(equipaments)
          response.data.items.map((item: any) => {
            realm.create("EquipamentCollected", {
              id: item.id,
              equipment_type: item.equipment_type,
              current_customer: item.current_customer,
              created_at: new Date(),
            })
          })
        }
      })
    }

    return response.data
  } catch (error: any) {
    console.log(error)
    // reconnect()
  } finally {
    // realm.close();
  }
}
