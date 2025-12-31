import api from "./connection"
import reconnect from "./reconnect"
import { retrieveDomain } from "./retrieveUserSession"
import { getRealm } from "../databases/realm"

const getVoyages = async () => {
  const realm = await getRealm()
  const URL = await retrieveDomain()

  try {
    const credentials: any = realm.objects("Credentials")[0]
    const params = {
      "access-token": credentials.accessToken,
      "client": credentials.client,
      "uid": credentials.uid,
    }

    const response = await api.get(`${URL.data}/operations/voyages`, { params })
    //Pegar a resposta e salvar no realmDB

    return response.data
  } catch (error: any) {
    console.log(error)
    // reconnect()
  } finally {
    // realm.close();
  }
}

export default getVoyages
