import login from "./login"
import { retrieveUserSession } from "./retrieveUserSession"
import { getCredentials } from "../databases/database"

const reconnect = async () => {
  const credentials: any = getCredentials()
  if (!credentials?.accessToken) return
  const user: any = await retrieveUserSession()
  console.log("reconnect chamado")
  if (user) {
    await login(user.email, user.password)
  }
}

export default reconnect
