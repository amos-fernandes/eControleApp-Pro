import api from "./connection"
import { retrieveDomain } from "./retrieveUserSession"
import { getCredentials } from "../databases/database"

export const generateMTR = async (orderId: number, photoUri: string | null, metadata: any = {}) => {
  const URL = await retrieveDomain()

  const credentials: any = getCredentials()
  if (!credentials || !credentials.accessToken) throw new Error("NO_CREDENTIALS")

  const formData = new FormData()
  formData.append("mtr[order_id]", String(orderId))
  Object.keys(metadata || {}).forEach((k) => formData.append(k, metadata[k]))

  if (photoUri) {
    // filename inference
    const filename = photoUri.split('/').pop() || `photo-${Date.now()}.jpg`
    const file: any = {
      uri: photoUri,
      name: filename,
      type: "image/jpeg",
    }
    formData.append("mtr[photo]", file as any)
  }

  return api.post(`${URL?.data}/service_orders/${orderId}/mtr`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      "access-token": credentials.accessToken,
      client: credentials.client,
      uid: credentials.uid,
    },
  })
}

export default generateMTR
