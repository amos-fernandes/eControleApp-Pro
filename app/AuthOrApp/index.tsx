import { useEffect, useState } from "react"

import { retrieveUserSession, retrieveDomain } from "../../services/retrieveUserSession"
import { GetDataFromSecureStore } from "@/utils/SecureStore"
import Authentication from "../Authentication"
import ListServicesOrder from "../ListServicesOrder"
import { getCredentials } from "../../databases/database"

function AuthOrApp() {
  const [ready, setReady] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const user = await retrieveUserSession()
        const domain = await retrieveDomain()
        const userObj = user && (user.data ? user.data : user)

        // Exijo user_session (com email) e domínio válidos e credenciais armazenadas no Realm
        // Além disso, exijo uma flag explícita `auto_login` no SecureStore para permitir login automático.
        const allowAuto = (await GetDataFromSecureStore("auto_login")) === "true"
        if (userObj && userObj.email && domain && domain.status === 200 && allowAuto) {
          try {
            const creds: any = getCredentials()
            if (creds && creds.accessToken) {
              setAuthenticated(true)
            }
          } catch (e) {
            // credenciais indisponíveis ou não persistidas — trato como não autenticado
            setAuthenticated(false)
          }
        }
      } catch (e) {
        // ignoro e faço fallback para não autenticado
      } finally {
        setReady(true)
      }
    }

    fetchData()
  }, [])

  if (!ready) return null

  return authenticated ? <ListServicesOrder /> : <Authentication />
}

export default AuthOrApp
