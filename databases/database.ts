import Realm from 'realm'
import { getRealm } from './realm'

/**
 * Inicializa o esquema de tabelas do banco de dados Realm.
 */
export const initDatabase = async () => {
    // Realm schemas are defined in realm.native.ts, so no initialization needed here
    console.log('Database initialized (Realm)')
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
            _id: user._id,
            email: user.email,
            name: user.name,
            created_at: new Date(),
        }, Realm.UpdateMode.Modified)
    })
}

/**
 * Realiza a insercao de uma Ordem de Servico de forma atomica.
 */
export const insertServiceOrder = async (order: any) => {
    const realm = await getRealm()
    realm.write(() => {
        // Create or update service order
        const serviceOrder = realm.create('ServicesOrdersList', {
            id: order.id,
            identifier: order.identifier,
            status: order.status,
            service_date: order.service_date,
            customer_id: order.customer_id,
            customer_name: order.customer?.name,
            address_text: order.address?.to_s || order.address?.name,
            observations: order.observations,
            driver_observations: order.driver_observations,
            created_at: order.created_at,
            vehicle_info: order.vehicle ? JSON.stringify(order.vehicle) : null,
            voyage_info: order.voyage ? JSON.stringify(order.voyage) : null,
        }, Realm.UpdateMode.Modified)

        // Delete existing executions for this order
        const existingExecutions = realm.objects('SubmitService').filtered('_id == $0', order.id.toString())
        realm.delete(existingExecutions)

        // Insert new executions
        if (Array.isArray(order.service_executions)) {
            order.service_executions.forEach((exec: any) => {
                realm.create('SubmitService', {
                    _id: `${order.id}_${exec.service?.name}_${exec.amount}`,
                    service_order_id: order.id,
                    service_name: exec.service?.name,
                    amount: exec.amount,
                    unit_name: exec.unit?.name,
                    item_weights: exec.service_item_weights ? JSON.stringify(exec.service_item_weights) : null,
                })
            })
        }
    })
}

/**
 * Retorna todas as Ordens de Servico armazenadas localmente.
 */
export const getServiceOrders = async () => {
    const realm = await getRealm()
    return Array.from(realm.objects('ServicesOrder'))
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
