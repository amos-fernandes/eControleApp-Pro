import { SaveDataToSecureStore } from "@/utils/SecureStore"

import api from "./connection"
import { retrieveDomain } from "./retrieveUserSession"

const login = async (email: string, password: string) => {
  try {
    const URL = await retrieveDomain()
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
    throw error
  }
}
export default login
