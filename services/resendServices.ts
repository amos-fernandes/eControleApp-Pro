import sendServiceOrder from "./sendServiceOrder"
import { getRealm } from "../databases/realm"

export const resendService = async () => {
  const realm = await getRealm()

  try {
    const services: any = realm.objects("SubmitService")

    if (services.length > 0) {
      for (const service of services) {
        const id = service._id
        delete service._id
        const response: any = await sendServiceOrder(id, service)

        if (response?.status === 200 || response?.status === 403) {
          const service = realm.objects("SubmitService").filtered(`_id = '${id}'`)[0]
          realm.write(() => {
            realm.delete(service)
          })
        }
      }
    }
  } catch (error) {
    console.log(error)
  } finally {
    // realm.close();
  }
}
