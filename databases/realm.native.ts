import { CredentialsSchema } from "./schemas/Credentials"
import {
  CurrentCustomerCollectedSchema,
  EquipamentSchemaCollected,
} from "./schemas/EquipamentCollected"
import { CurrentCustomerLeftSchema, EquipamentSchemaLeft } from "./schemas/EquipamentLeft"
import { LoginSchema } from "./schemas/Login"
import {
  AddressLocation,
  AddressSchema,
  ContactSchema,
  CustomerSchema,
  EmployeeSchema,
  OptionsSchema,
  ServiceSchema,
  ServicesOrderSchema,
  ServicesSchema,
  ServiceItemsSchema,
  VehicleManufacturerSchema,
  VehicleSchema,
  VoyageSchema,
} from "./schemas/ServicesOrder"
import {
  ServiceExecutionSchema,
  ServicesExecutionsSchema,
  SubmitServiceOrderSchema,
} from "./schemas/SubmitServiceOrder"

export const getRealm = async () => {
  let Realm: any
  try {
    // require at runtime to avoid evaluating native binary on static import
    // which triggers the "Could not find the Realm binary" error when
    // a native build including Realm is not present (e.g. Expo Go).
    // Using require here delays module loading until runtime.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    Realm = require("realm")
  } catch (err: any) {
    console.warn("Realm runtime load failed (native binary missing). Using in-memory stub.", err)

    // In-memory stub with minimal create/delete/objects behavior so
    // credentials written by `saveCredentials` are available for subsequent calls.
    const createInMemoryRealm = () => {
      const store: Record<string, any[]> = {}

      return {
        _isStub: true,
        objects: (name: string) => {
          store[name] = store[name] || []
          // Return a shallow copy to mimic Realm's live results
          return store[name].slice()
        },
        delete: (objs: any[] | any) => {
          if (!objs) return
          // If passed an array of objects, remove by _id from all collections
          if (Array.isArray(objs) && objs.length > 0) {
            const ids = objs.map((o: any) => o && o._id).filter(Boolean)
            if (ids.length === 0) return
            Object.keys(store).forEach((k) => {
              store[k] = store[k].filter((item) => !ids.includes(item._id))
            })
            return
          }
          // If passed a single object with _id, remove it
          if (objs && objs._id) {
            Object.keys(store).forEach((k) => {
              store[k] = store[k].filter((item) => item._id !== objs._id)
            })
          }
        },
        create: (name: string, obj: any) => {
          store[name] = store[name] || []
          store[name].push(obj)
        },
        write: (fn: Function) => {
          try {
            fn && fn()
          } catch (e) {
            /* noop */
          }
        },
        close: () => {
          /* noop */
        },
      }
    }

    return createInMemoryRealm()
  }

  // If Realm object doesn't provide `open`, fall back to stub
  if (!Realm || typeof Realm.open !== "function") {
    console.warn("Realm loaded but does not expose open(); using in-memory stub instead.")
    const createInMemoryRealm = () => {
      const store: Record<string, any[]> = {}

      return {
        _isStub: true,
        objects: (name: string) => {
          store[name] = store[name] || []
          return store[name].slice()
        },
        delete: (objs: any[] | any) => {
          if (!objs) return
          if (Array.isArray(objs) && objs.length > 0) {
            const ids = objs.map((o: any) => o && o._id).filter(Boolean)
            if (ids.length === 0) return
            Object.keys(store).forEach((k) => {
              store[k] = store[k].filter((item) => !ids.includes(item._id))
            })
            return
          }
          if (objs && objs._id) {
            Object.keys(store).forEach((k) => {
              store[k] = store[k].filter((item) => item._id !== objs._id)
            })
          }
        },
        create: (name: string, obj: any) => {
          store[name] = store[name] || []
          store[name].push(obj)
        },
        write: (fn: Function) => {
          try {
            fn && fn()
          } catch (e) {
            /* noop */
          }
        },
        close: () => {},
      }
    }

    return createInMemoryRealm()
  }

  return await Realm.open({
    path: "econtrole-app",
    schema: [
      LoginSchema,
      CredentialsSchema,
      ServicesOrderSchema,
      AddressLocation,
      CustomerSchema,
      AddressSchema,
      ContactSchema,
      VehicleSchema,
      VehicleManufacturerSchema,
      EmployeeSchema,
      VoyageSchema,
      ServiceItemsSchema,
      ServicesSchema,
      ServiceSchema,
      OptionsSchema,
      CurrentCustomerLeftSchema,
      EquipamentSchemaLeft,
      CurrentCustomerCollectedSchema,
      EquipamentSchemaCollected,
      SubmitServiceOrderSchema,
      ServicesExecutionsSchema,
      ServiceExecutionSchema,
    ],
  })
}
