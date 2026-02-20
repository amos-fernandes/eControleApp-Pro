import { GetDataFromSecureStore } from "@/utils/SecureStore"
import { Platform } from 'react-native'

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
  // Para desenvolvimento web, uso proxy para evitar problemas de CORS
  if (Platform.OS === 'web') {
    return { status: 200, data: '' }
  }

  try {
    const session: any = await GetDataFromSecureStore("domain")
    if (!session) return { status: 404 }

    // `GetDataFromSecureStore` pode retornar um objeto parseado na web ou uma string JSON no native.
    const parsedSession = typeof session === 'string' ? JSON.parse(session) : session
    let domain = parsedSession.domain

    if (!domain) return { status: 404 }

    // Rejeito links do Metro/Expo
    if (domain.includes("expo-development-client") || domain.includes("192.168") || domain.includes("8081")) {
      console.log("DETECTED METRO QR CODE. REJECTING.")
      return { status: 400, data: "INVALID_URL_METRO" }
    }

    // Se for uma URL completa
    if (domain.startsWith("http://") || domain.startsWith("https://")) {
      try {
        // Tento seguir redirecionamentos (por exemplo short URLs como qrco.de)
        // usando fetch para obter a URL final, quando possível.
        const resp = await fetch(domain, { method: 'GET' })
        const finalUrl = resp.url || domain

        // Uso parsing de URL para remover query strings e normalizar o caminho
        try {
          const parsed = new URL(finalUrl)
          // Se o caminho termina com /login, removo; caso contrário removo qualquer caminho /login no final
          let pathname = parsed.pathname.replace(/\/login\/?$/, "")
          if (!pathname) pathname = ''
          let normalized = `${parsed.protocol}//${parsed.hostname}${parsed.port ? ':' + parsed.port : ''}${pathname}`
          normalized = normalized.replace(/\/$/, "")
          if (!normalized.endsWith("/api")) {
            normalized = normalized + "/api"
          }
          return { status: 200, data: normalized }
        } catch (e) {
          // fallback: removo querystring e /login de forma simples
          let simple = finalUrl.split('?')[0]
          simple = simple.replace(/\/login\/?$/, "")
          simple = simple.replace(/\/$/, "")
          if (!simple.endsWith("/api")) simple = simple + "/api"
          return { status: 200, data: simple }
        }
      } catch (err) {
        // Se seguir redirects falhar (ex: cloudflare challenge), caio para a
        // normalização simples da URL lida do QR.
        domain = domain.replace(/\/login\/?$/, "")
        domain = domain.replace(/\/$/, "")
        if (!domain.endsWith("/api")) {
          domain = domain + "/api"
        }
        return { status: 200, data: domain }
      }
    }

    // Caso seja apenas o subdomínio
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
