import axios from "axios"
import uuid from "react-native-uuid"

import { getRealm } from "../databases/realm"
import { headersTypes } from "../enums/headersTypes"
import { HeadersTypes } from "../interfaces/HeadersTypes"



function transformResponse(data: any, header: any) {
  const contentType = header[headersTypes.contentTypeHeader]
  if (contentType && contentType.match(/application\/json/i)) {
    const { accessToken, tokenType, uid, client } = headersTypes
    const formatedData: HeadersTypes = {
      accessToken: header[accessToken],
      tokenType: header[tokenType],
      uid: header[uid],
      client: header[client],
    }

    saveCredentials(formatedData)
    return data
  }
  return data
}

async function saveCredentials(data: HeadersTypes) {
  console.log("Saving credentials to Realm:", data)
  const realm = await getRealm()

  try {
    if (data && data.accessToken && data.client && data.uid) {
      const credentials = realm.objects("Credentials")
      realm.write(() => {
        realm.delete(credentials)
        realm.create("Credentials", {
          _id: uuid.v4().toString(),
          accessToken: data.accessToken,
          uid: data.uid,
          client: data.client,
          created_at: new Date(),
        })
      })
    }
  } catch (error) {
    console.log("saveCredentials error: ", error)
  }
}

const axiosEControleConfig = {
  transformResponse: transformResponse,
  timeout: 30000,
  baseURL: "https://testeaplicativo.econtrole.com/api",
}

const api = axios.create(axiosEControleConfig)

async function setAxiosHeaders() {
  try {
    const realm = await getRealm()
    const credentials: any = await realm.objects("Credentials")[0]

    if (credentials) {
      axios.defaults.headers.common["access-token"] = credentials.accessToken
      axios.defaults.headers.common["client"] = credentials.client
      axios.defaults.headers.common["uid"] = credentials.uid
    }
  } catch (error) {
    console.log("setAxiosHeaders error:", error)
  }
}

api.interceptors.request.use(
  async (config) => {
    await setAxiosHeaders()
    console.log("REQUEST STARTED")
    console.log("Method:", config.method?.toUpperCase())
    console.log("URL:", config.url)
    console.log("-----------------------------")
    return config
  },
  (error) => {
    console.log("REQUEST ERROR:", error.message)
    return Promise.reject(error)
  },
)

api.interceptors.response.use(
  (response) => {
    console.log("RESPONSE SUCCESS")
    console.log("Status:", response.status)
    console.log("URL:", response.config.url)
    console.log("-----------------------------")
    return response
  },
  (error) => {
    console.log("RESPONSE ERROR")
    console.log("Message:", error.message)
    console.log("Status:", error.response?.status)
    console.log("URL:", error.config?.url)
    console.log("-----------------------------")
    return Promise.reject(error)
  },
)
export default api
