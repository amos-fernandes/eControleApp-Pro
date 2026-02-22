import { useCallback, useEffect, useState } from "react"
import {
  View,
  ScrollView,
  BackHandler,
  Text,
  RefreshControl,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native"
import { useFocusEffect, useRoute } from "@react-navigation/native"
import { useNavigation } from "@react-navigation/native"
import { SafeAreaView } from "react-native-safe-area-context"

import { useFilterServiceOrderStore } from "@/stores/useFilterServiceOrder";
import { getServicesOrders } from "@/services/servicesOrders"
import { retrieveUserSession } from "@/services/retrieveUserSession"

import Card from "../../components/Card"
import BottomNavigation from "../../components/BottomNavigation"
import ListServicesFilters from "./ListServicesFilters"

const isListServicesOrderScreen = (route: any) => route.name === "ListServicesOrder"

function ListServicesOrder(): JSX.Element {
  const navigation = useNavigation()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const { filters } = useFilterServiceOrderStore()

  const fetchOrders = async (_filters?: any) => {
    setLoading(true)
    setError(null)
    try {
      // Não tento buscar ordens se o usuário não está autenticado neste dispositivo
      const session = await retrieveUserSession()
      const userObj = session && (session.data ? session.data : session)
      if (!userObj || !userObj.email) {
        console.log("fetchOrders: no local session, skipping remote fetch")
        setOrders([])
        return
      }

      const response = await getServicesOrders({ filters })
      console.log('fetchOrders response shape:', response && Object.keys(response))

      // Normalizo possíveis formatos de resposta: o servidor pode retornar array diretamente
      // ou envolver em `data` (axios) ou `data.data` (API wrapper).
      let ordersData: any[] = []
      if (!response) {
        ordersData = []
      } else if (Array.isArray(response.data)) {
        ordersData = response.data
      } else if (response.data && Array.isArray(response.data.items)) {
        console.log('fetchOrders response.data.items length:', response.data.items.length)
        ordersData = response.data.items
      } else if (response.data && Array.isArray(response.data.data)) {
        ordersData = response.data.data
      } else if (response.data && Array.isArray(response.data.service_orders)) {
        ordersData = response.data.service_orders
      } else if (Array.isArray(response)) {
        ordersData = response
      } else {
        // último recurso: tento encontrar qualquer array no objeto de resposta
        const maybeArray = Object.values(response).find((v: any) => Array.isArray(v))
        ordersData = Array.isArray(maybeArray) ? maybeArray : []
      }

      console.log('Resolved orders count:', Array.isArray(ordersData) ? ordersData.length : 0)
      if (Array.isArray(ordersData) && ordersData.length > 0) {
        console.log('First order sample:', JSON.stringify(ordersData[0], null, 2))
        console.log('First order voyage structure:', ordersData[0]?.voyage)
      }
      setOrders(ordersData)
    } catch (error: any) {
      console.log("Fetch orders error:", error)
      setError("Erro ao carregar ordens de serviço")
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const route = useRoute()
  const handleBackButton = () => {
    if (isListServicesOrderScreen(route)) {
      return true
    }
    return false
  }

  useFocusEffect(
    useCallback(() => {
      BackHandler.addEventListener("hardwareBackPress", handleBackButton)

      return () => {
        BackHandler.removeEventListener("hardwareBackPress", handleBackButton)
      }
    }, [route])
  )

  useEffect(() => {
    fetchOrders(filters)
  }, [filters])

  console.log("Route params changed:", route.params)

  const refreshServicesOrderList = () => {
    fetchOrders(filters)
  }

  // Agrupo ordens por viagem (defensivo: garanto que `orders` é um array)
  const groupOrdersByVoyage = (orders: any[]) => {
    if (!Array.isArray(orders)) return {}
    const grouped = orders.reduce((acc, order) => {
      // Tento obter o nome da viagem com múltiplas tentativas
      let voyageName = "Sem Viagem"
      
      if (order?.voyage) {
        // voyage pode ser objeto ou string
        if (typeof order.voyage === 'object') {
          voyageName = order.voyage.name || 
                       order.voyage.voyage_name || 
                       order.voyage.identifier || 
                       String(order.voyage.id || '')
        } else if (typeof order.voyage === 'string') {
          voyageName = order.voyage
        }
      }
      
      // Fallback para outros campos possíveis
      if (voyageName === "Sem Viagem" || !voyageName) {
        voyageName = order?.voyage_name || 
                     order?.voyageName || 
                     order?.trip_name ||
                     order?.tripName ||
                     order?.route_name ||
                     (order?.voyage_id ? `Viagem #${order.voyage_id}` : "Sem Viagem")
      }

      if (!acc[voyageName]) {
        acc[voyageName] = []
      }
      acc[voyageName].push(order)
      return acc
    }, {} as Record<string, any[]>)
    return grouped
  }

  const groupedOrders = groupOrdersByVoyage(Array.isArray(orders) ? orders : [])
  const groupedArray = Object.entries(groupedOrders).map(([voyageName, orders]) => ({
    voyageName,
    orders: orders as any[]
  }))

  return (
    <SafeAreaView>
      <View
        style={{
          height: "100%",
          backgroundColor: "#fff",
          justifyContent: "flex-start",
          alignItems: "stretch",
        }}
      >
        {/* Header com botão de filtros */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#e0e0e0" }}>
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#333" }}>
            {filters.voyage === "all" ? "Todas as Viagens" : filters.voyage === "assigned" ? "Com Viagem" : "Sem Viagem"}
          </Text>
          <TouchableOpacity
            onPress={() => setShowFilters(true)}
            style={{
              backgroundColor: "#007AFF",
              paddingHorizontal: 15,
              paddingVertical: 8,
              borderRadius: 8,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 14, fontWeight: "bold", marginLeft: 5 }}>
              📊 Filtros
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#56d156" />
            <Text style={{ marginTop: 10, color: "#666" }}>Carregando ordens de serviço...</Text>
          </View>
        ) : error ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
            <Text style={{ fontSize: 16, color: "red", textAlign: "center" }}>{error}</Text>
            <Text style={{ fontSize: 14, color: "#666", textAlign: "center", marginTop: 10 }}>
              Verifique sua conexão e tente novamente
            </Text>
          </View>
        ) : (!Array.isArray(orders) || orders.length === 0) ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: 20,
            }}
          >
            <Text style={{ fontSize: 17, color: "#666", textAlign: "center" }}>
              Nenhuma ordem de serviço encontrada.
            </Text>
            <Text style={{ fontSize: 14, color: "#999", textAlign: "center", marginTop: 10 }}>
              Verifique os filtros aplicados ou tente recarregar
            </Text>
          </View>
        ) : (
          <FlatList
            data={groupedArray}
            keyExtractor={(item, index) => `${item.voyageName}-${index}`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingVertical: 10,
              alignItems: "center",
            }}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={refreshServicesOrderList} />
            }
            renderItem={({ item }) => (
              <View style={{ width: "90%" }}>
                <Card cardData={item.orders} />
              </View>
            )}
            ListEmptyComponent={
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ fontSize: 17 }}>Nenhuma ordem de serviço encontrada.</Text>
              </View>
            }
          />
        )}
      </View>
      <BottomNavigation currentScreen="ListServicesOrder" />
      <ListServicesFilters visible={showFilters} onClose={() => setShowFilters(false)} />
    </SafeAreaView>
  )
}

export default ListServicesOrder
