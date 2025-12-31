import { GetDataFromSecureStore } from "@/utils/SecureStore"

import { ResponseInterface } from "../interfaces/Response"
import decoded from "../utils/decoded"

export const retrieveUserSession = async (): Promise<ResponseInterface> => {
  try {
    const session = await GetDataFromSecureStore("user_session")
    if (session) {
      return JSON.parse(session)
    }
    return { status: 404, data: "retrieveUserSession" }
  } catch (error) {
    console.log("retrieveUserSession: ", error)
    return { status: 401 }
  }
}

export const retrieveDomain = async (): Promise<ResponseInterface> => {
  try {
    const session: any = await GetDataFromSecureStore("domain")
    if (!session) return { status: 404 }

    const parsedSession = JSON.parse(session)
    let domain = parsedSession.domain

    if (!domain) return { status: 404 }

    // Rejeita links do Metro/Expo
    if (domain.includes("expo-development-client") || domain.includes("192.168") || domain.includes("8081")) {
      console.log("DETECTED METRO QR CODE. REJECTING.")
      return { status: 400, data: "INVALID_URL_METRO" }
    }

    // Se for uma URL completa
    if (domain.startsWith("http://") || domain.startsWith("https://")) {
      // Normalizacao: remove /login se o usuario escaneou a pagina de login
      domain = domain.replace(/\/login\/?$/, "")
      // Remove barra final se existir
      domain = domain.replace(/\/$/, "")

      if (!domain.endsWith("/api")) {
        domain = domain + "/api"
      }

      return { status: 200, data: domain }
    }

    // Caso seja apenas o subdominio
    const decodedValue: any = decoded(parsedSession)
    const isPrintable = /^[\x20-\x7E]*$/.test(decodedValue)
    const finalSubdomain = isPrintable && decodedValue ? decodedValue : domain

    const finalUrl = "https://" + finalSubdomain + ".econtrole.com/api"
    return { status: 200, data: finalUrl }
  } catch (error) {
    console.log("retrieveDomain Error:", error)
    return { status: 401 }
  }
}
