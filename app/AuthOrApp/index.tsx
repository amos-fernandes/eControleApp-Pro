import { useEffect, useState } from "react"

import { retrieveUserSession, retrieveDomain } from "../../services/retrieveUserSession"
import { GetDataFromSecureStore } from "@/utils/SecureStore"
import Authentication from "../Authentication"
import Home from "../Home"
import { getCredentials } from "@/databases/database"

function AuthOrApp() {
  const [ready, setReady] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const user = await retrieveUserSession()
        const domain = await retrieveDomain()
        const userObj = user && (user.data ? user.data : user)

        // Require user_session (having an email) and domain to be valid and have credentials stored in DB
        // Additionally require an explicit `auto_login` flag in SecureStore to allow automatic login.
        const allowAuto = (await GetDataFromSecureStore("auto_login")) === "true"
        if (userObj && userObj.email && domain && domain.status === 200 && allowAuto) {
          try {
            const creds: any = getCredentials()
            if (creds && creds.accessToken) {
              setAuthenticated(true)
            }
          } catch (e) {
            // credentials unavailable — treat as not authenticated
            setAuthenticated(false)
          }
        }
      } catch (e) {
        // ignore and fall back to unauthenticated
      } finally {
        setReady(true)
      }
    }

    fetchData()
  }, [])

  if (!ready) return null

  return authenticated ? <Home /> : <Authentication />
}

export default AuthOrApp
