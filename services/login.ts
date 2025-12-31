import { SaveDataToSecureStore } from "@/utils/SecureStore"

import api from "./connection"
import { retrieveDomain } from "./retrieveUserSession"

const login = async (email: string, password: string) => {
  try {
    const URL = await retrieveDomain()
    if (!URL || URL.status !== 200 || !URL.data) {
      throw new Error("INVALID_DOMAIN")
    }
    if (email && password) {
      const response: any = await api
        .post(`${URL.data}/auth/sign_in`, {
          email,
          password,
        })
        .then(async (response) => {
          await SaveDataToSecureStore(
            "user_session",
            JSON.stringify({
              email,
              password,
            }),
          )
          return response
        })

      return response
    } else {
      throw new Error("Email ou senha vazios ou invalidos.")
    }
  } catch (error) {
    console.log("login: ", error)
    console.log("login error response data:", (error as any).response?.data)
    throw error
  }
}
export default login
