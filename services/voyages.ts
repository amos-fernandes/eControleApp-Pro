import api from "./connection"
import reconnect from "./reconnect"
import { retrieveDomain } from "./retrieveUserSession"
import { getCredentials as getSQLiteCredentials } from "../databases/database"

const getVoyages = async () => {
  const URL = await retrieveDomain()

  try {
    const credentials: any = getSQLiteCredentials()
    const params = {
      "access-token": credentials.accessToken,
      "client": credentials.client,
      "uid": credentials.uid,
    }

    const response = await api.get(`${URL.data}/operations/voyages`, { params })
    // Response data is returned without local persistence for now

    return response.data
  } catch (error: any) {
    console.log(error)
    // reconnect()
  }
}

export default getVoyages
