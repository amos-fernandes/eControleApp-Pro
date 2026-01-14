import Realm from 'realm'
import { getRealm } from './realm'

// In-memory storage fallback for when Realm is not available
const memoryStorage: { credentials: any[] } = { credentials: [] }

/**
 * Inicializa o esquema de tabelas do banco de dados Realm.
 */
export const initDatabase = async () => {
    console.log('Database initialization starting...')
    try {
        // Test if Realm can be loaded by calling getRealm
        const realm = await getRealm()
        console.log('Database initialized successfully, Realm instance:', !!realm)
        
        // Test if we can access objects
        if (realm && typeof realm.objects === 'function') {
            const objects = realm.objects('Credentials')
            console.log('Credentials objects accessible:', Array.isArray(objects))
        }
    } catch (error: any) {
        console.error('Database initialization failed:', error)
        // Don't re-throw, let the app continue with in-memory fallback
    }
}

/**
 * Insere ou atualiza as credenciais de autenticacao.
 */
export const insertCredentials = async (cred: any) => {
    try {
        const realm = await getRealm()
        realm.write(() => {
            realm.create('Credentials', {
                _id: cred._id || 'main',
                accessToken: cred.accessToken,
                uid: cred.uid,
                client: cred.client,
                created_at: new Date(),
            }, Realm.UpdateMode.Modified)
        })
    } catch (error) {
        console.warn('Realm insertCredentials failed, using in-memory storage:', error)
        memoryStorage.credentials[0] = {
            _id: cred._id || 'main',
            accessToken: cred.accessToken,
            uid: cred.uid,
            client: cred.client,
            created_at: new Date(),
        }
    }
}

/**
 * Insere ou atualiza os dados do usuario.
 */
export const insertUser = async (user: any) => {
    const realm = await getRealm()
    realm.write(() => {
        realm.create('Login', {
            _id: user?._id || 'main',
            email: user?.email || '',
            name: user?.name || null,
            created_at: new Date(),
        }, 'modified')
    })
}

/**
 * Realiza a insercao de uma Ordem de Servico de forma atomica.
 */
export const insertServiceOrder = async (order: any) => {
    const realm = await getRealm()
    realm.write(() => {
        // Create or update service order
        realm.create('ServicesOrdersList', {
            id: Number(order?.id ?? 0),
            identifier: order?.identifier || '',
            status: order?.status || '',
            service_date: String(order?.service_date || ''),
            customer_id: order?.customer_id ?? null,
            customer_name: order?.customer?.name || null,
            address_text: order?.address?.to_s || order?.address?.name || null,
            observations: order?.observations || null,
            driver_observations: order?.driver_observations || null,
            created_at: String(order?.created_at || ''),
            vehicle_info: order?.vehicle ? JSON.stringify(order.vehicle) : null,
            voyage_info: order?.voyage ? JSON.stringify(order.voyage) : null,
        }, 'modified')
    })
}

/**
 * Retorna todas as Ordens de Servico armazenadas localmente.
 */
export const getServiceOrders = async () => {
    const realm = await getRealm()
    return Array.from(realm.objects('ServicesOrdersList'))
}

/**
 * Obtem a credencial ativa.
 */
export const getCredentials = async () => {
    try {
        const realm = await getRealm()
        const credentials = realm.objects('Credentials')
        return credentials.length > 0 ? credentials[0] : null
    } catch (error) {
        console.warn('Realm getCredentials failed, using in-memory storage:', error)
        return memoryStorage.credentials.length > 0 ? memoryStorage.credentials[0] : null
    }
}

/**
 * Limpa todos os dados locais.
 */
export const clearDatabase = async () => {
    const realm = await getRealm()
    realm.write(() => {
        realm.deleteAll()
    })
}
