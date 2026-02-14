import axios from "axios"
import uuid from "react-native-uuid"

import { getRealm } from "../databases/realm"
import { getCredentials } from "../databases/database"
import { Platform } from 'react-native'
import { headersTypes } from "../enums/headersTypes"
import { HeadersTypes } from "../interfaces/HeadersTypes"

async function saveCredentials(data: HeadersTypes) {
  console.log("Saving credentials to SQLite:", data)

  try {
    if (data && data.accessToken && data.client && data.uid) {
      const credentials = {
        _id: uuid.v4().toString(),
        accessToken: data.accessToken,
        uid: data.uid,
        client: data.client,
        created_at: new Date(),
      }
      // Usar a função de banco de dados SQLite para inserir as credenciais
      const { insertCredentials } = await import("../databases/database")
      insertCredentials(credentials)
    }
  } catch (error) {
    console.log("saveCredentials error: ", error)
  }
}

const axiosEControleConfig = {
  timeout: 30000,
  // For web, set baseURL to empty string to use relative URLs with proxy
  // For native, do not set baseURL as the app constructs full URLs at call sites
  // using the domain saved by scanning the QR (retrieveDomain()).
  baseURL: Platform.OS === 'web' ? '' : undefined,
}

const api = axios.create(axiosEControleConfig)

async function setAxiosHeaders() {
  try {
    if (Platform.OS === 'web') {
      // On web we do not have SQLite native; avoid attempting to access it.
      return
    }

    // Usar a função de banco de dados SQLite para obter as credenciais
    const { getCredentials } = await import("../databases/database")
    const credentials: any = getCredentials()

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

    try {
      const h: any = response.headers || {}
      const accessToken = h[headersTypes.accessToken]
      const client = h[headersTypes.client]
      const uid = h[headersTypes.uid]
      const tokenType = h[headersTypes.tokenType]

      // Only persist credentials when this response is from the login endpoint
      const reqUrl = (response.config && response.config.url) ? String(response.config.url) : ""
      const reqMethod = (response.config && response.config.method) ? String(response.config.method).toLowerCase() : ""
      const isAuthResponse = reqUrl.includes("/auth/sign_in") || (reqMethod === "post" && reqUrl.includes("/auth"))

      if (isAuthResponse && accessToken && client && uid) {
        saveCredentials({ accessToken, client, uid, tokenType } as HeadersTypes)
        console.log("Saved credentials from response headers (auth response)")
      } else if (accessToken && client && uid) {
        console.log("Auth headers present but not saved (non-auth response):", reqMethod, reqUrl)
      }
      // Debug: log which auth headers are present (if any)
      try {
        const authHeaders = [headersTypes.accessToken, headersTypes.client, headersTypes.uid]
        const present = Object.keys(h).filter((k) => authHeaders.includes(k as any))
        console.log('Response headers keys present for auth:', present)
      } catch (e) {
        // ignore
      }
    } catch (err) {
      console.log("response interceptor saveCredentials error:", err)
    }

    return response
  },
  (error) => {
    console.log("RESPONSE ERROR")
    console.log("Message:", error.message)
    console.log("Status:", error.response?.status)
    console.log("Response data:", error.response?.data)
    console.log("Response headers:", error.response?.headers)
    console.log("URL:", error.config?.url)
    console.log("-----------------------------")
    return Promise.reject(error)
  },
)
export default api
