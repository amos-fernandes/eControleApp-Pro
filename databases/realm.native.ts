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

    // Provide a minimal stub that implements the methods the app expects
    // This avoids crashes on devices where the native Realm binary wasn't included.
    const stubRealm = {
      _isStub: true,
      objects: (name: string) => {
        if (name === "Credentials") {
          return [
            {
              accessToken: null,
              client: null,
              uid: null,
              _id: "stub",
            },
          ]
        }
        return []
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

    return stubRealm
  }

  // If Realm object doesn't provide `open`, fall back to stub
  if (!Realm || typeof Realm.open !== "function") {
    console.warn("Realm loaded but does not expose open(); using stub instead.")
    const stubRealm = {
      _isStub: true,
      objects: (name: string) => {
        if (name === "Credentials") {
          return [
            {
              accessToken: null,
              client: null,
              uid: null,
              _id: "stub",
            },
          ]
        }
        return []
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

    return stubRealm
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
