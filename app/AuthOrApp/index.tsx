import { useEffect, useState } from "react"

import { retrieveUserSession } from "../../services/retrieveUserSession"
import Authentication from "../Authentication"
import ListServicesOrder from "../ListServicesOrder"

function AuthOrApp() {
  const [user, setUser]: any = useState({})

  useEffect(() => {
    async function fetchData() {
      const data = await retrieveUserSession()
      setUser(data)
    }

    fetchData()
  }, [])

  if (!user.email) {
    return <Authentication />
  }

  return <ListServicesOrder />
}

export default AuthOrApp
