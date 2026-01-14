// Simple in-memory storage fallback
const memoryStorage: Record<string, any[]> = {}

// Create a stub Realm object that mimics basic Realm functionality
const createInMemoryRealm = () => {
  return {
    _isStub: true,
    objects: (name: string) => {
      memoryStorage[name] = memoryStorage[name] || []
      return memoryStorage[name].slice()
    },
    delete: (objs: any[] | any) => {
      if (!objs) return
      if (Array.isArray(objs) && objs.length > 0) {
        const ids = objs.map((o: any) => o && o._id).filter(Boolean)
        if (ids.length === 0) return
        Object.keys(memoryStorage).forEach((k) => {
          memoryStorage[k] = memoryStorage[k].filter((item) => !ids.includes(item._id))
        })
        return
      }
      if (objs && objs._id) {
        Object.keys(memoryStorage).forEach((k) => {
          memoryStorage[k] = memoryStorage[k].filter((item) => item._id !== objs._id)
        })
      }
    },
    deleteAll: () => {
      Object.keys(memoryStorage).forEach((k) => {
        memoryStorage[k] = []
      })
    },
    create: (name: string, obj: any) => {
      memoryStorage[name] = memoryStorage[name] || []
      memoryStorage[name].push(obj)
    },
    write: (fn: Function) => {
      try {
        fn && fn()
      } catch (e) {
        console.warn('In-memory write failed:', e)
      }
    },
    close: () => {
      console.log('In-memory realm closed')
    },
  }
}

export const getRealm = async () => {
  try {
    // Try to load Realm module
    const Realm = require("realm")
    
    // Check if Realm loaded properly
    if (!Realm || typeof Realm !== 'object') {
      console.warn('Realm module loaded but is not an object, using in-memory stub')
      return createInMemoryRealm()
    }
    
    // Check if Realm.open is a function
    if (typeof Realm.open !== 'function') {
      console.warn('Realm.open is not a function, using in-memory stub')
      return createInMemoryRealm()
    }
    
    // Define schemas
    const schemas = [
      {
        name: 'Login',
        primaryKey: '_id',
        properties: {
          _id: 'string',
          email: 'string',
          name: 'string?',
          password: 'string?',
          created_at: 'date',
        },
      },
      {
        name: 'Credentials',
        primaryKey: '_id',
        properties: {
          _id: 'string',
          accessToken: 'string',
          uid: 'string',
          client: 'string',
          created_at: 'date',
        },
      },
      {
        name: 'ServicesOrdersList',
        primaryKey: 'id',
        properties: {
          id: 'int',
          identifier: 'string',
          status: 'string',
          service_date: 'string',
          customer_id: 'int?',
          customer_name: 'string?',
          address_text: 'string?',
          observations: 'string?',
          driver_observations: 'string?',
          created_at: 'string?',
          vehicle_info: 'string?',
          voyage_info: 'string?',
        },
      },
    ]
    
    // Try to open Realm with schemas
    const realm = await Realm.open({
      path: "econtrole-app.realm",
      schema: schemas,
    })
    
    console.log('Realm opened successfully')
    return realm
    
  } catch (err: any) {
    console.warn('Failed to initialize Realm, using in-memory stub:', err?.message || err)
    return createInMemoryRealm()
  }
}
