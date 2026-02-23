import { useCallback, useEffect, useState } from "react"
import {
  View,
  ScrollView,
  BackHandler,
  Text,
  RefreshControl,
  ActivityIndicator,
  FlatList,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native"
import { useFocusEffect, useRoute } from "@react-navigation/native"
import { useNavigation } from "@react-navigation/native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"

import { useFilterServiceOrderStore } from "@/stores/useFilterServiceOrder";
import { getServicesOrders } from "@/services/servicesOrders"
import { retrieveUserSession } from "@/services/retrieveUserSession"

import Card from "../../components/Card"
import BottomNavigation from "../../components/BottomNavigation"
import { DefaultButton } from "../../components/Button"
import ListServicesFilters from "./ListServicesFilters"

const isListServicesOrderScreen = (route: any) => route.name === "ListServicesOrder"

function ListServicesOrder(): JSX.Element {
  const navigation = useNavigation()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const { filters } = useFilterServiceOrderStore()
  const layout = useWindowDimensions()
  const [index, setIndex] = useState(0)
  const [routes] = useState([
    { key: 'withTrips', title: 'Com Viagens' },
    { key: 'withoutTrips', title: 'Sem Viagens' },
  ])

  const fetchOrders = async (_filters?: any) => {
    setLoading(true)
    setError(null)
    try {
      console.log("🔄 Fetching orders with filters:", filters)
      
      // Don't attempt to fetch orders if the user is not authenticated on this device
      const session = await retrieveUserSession()
      const userObj = session && (session.data ? session.data : session)
      if (!userObj || !userObj.email) {
        console.log("fetchOrders: no local session, skipping remote fetch")
        setOrders([])
        return
      }

      const response = await getServicesOrders({ filters })
      console.log('fetchOrders response shape:', response && Object.keys(response))

      // Normalize possible response shapes: server may return array directly
      // or wrap it in `data` (axios) or `data.data` (API wrapper).
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
      } else if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        // Handle case where API returns object with numeric keys instead of array
        ordersData = Object.values(response.data)
      } else {
        // last resort: try to find any array in response object
        const maybeArray = Object.values(response).find((v: any) => Array.isArray(v))
        ordersData = Array.isArray(maybeArray) ? maybeArray : []
      }

      console.log('Resolved orders count:', Array.isArray(ordersData) ? ordersData.length : 0)
      if (Array.isArray(ordersData) && ordersData.length > 0) {
        console.log('First order sample:', ordersData[0])
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

  // Group orders by voyage and route date (defensive: ensure `orders` is an array)
  const groupOrdersByVoyage = (orders: any[]) => {
    if (!Array.isArray(orders)) return {}
    const grouped = orders.reduce((acc, order) => {
      // Try to get voyage name with priority
      const voyageName = order?.voyage?.name || 
                         order?.voyage_name || 
                         order?.voyageName || 
                         (order?.voyage && typeof order.voyage === 'string' ? order.voyage : null) ||
                         order?.voyage_id ||
                         order?.route_name ||
                         "Sem Viagem"
      
      // Try to get route date if available
      const routeDate = order?.route_date || order?.voyage?.date || order?.service_date || null
      
      // Create a combined key with voyage name and date if available
      const groupName = routeDate ? `${voyageName} (${new Date(routeDate).toLocaleDateString('pt-BR')})` : voyageName
      
      if (!acc[groupName]) {
        acc[groupName] = []
      }
      acc[groupName].push(order)
      return acc
    }, {} as Record<string, any[]>)
    return grouped
  }
  const WithTripsTab = ({ orders }: { orders: any[] }) => {
    const groupedOrders = groupOrdersByVoyage(orders)
    const groupedArray = Object.entries(groupedOrders).map(([voyageName, orders]) => ({
      voyageName,
      orders: orders as any[]
    }))
    return (
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
    )
  }
  const WithoutTripsTab = ({ orders }: { orders: any[] }) => {
    return (
      <FlatList
        data={orders}
        keyExtractor={(item, index) => `${item.code}-${index}`}
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
            <Card cardData={[item]} />
          </View>
        )}
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ fontSize: 17 }}>Nenhuma ordem de serviço encontrada.</Text>
          </View>
        }
      />
    )
  }

  const hasTrips = (order: any) => !!order?.voyage
  const ordersWithTrips = orders.filter(hasTrips)
  const ordersWithoutTrips = orders.filter(order => !hasTrips(order))

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
        {/* Header with Filter Button */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, backgroundColor: "#f8f9fa" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#333" }}>Ordens de Serviço</Text>
          <TouchableOpacity 
            onPress={() => setShowFilters(true)} 
            style={{ padding: 8, backgroundColor: "#007AFF", paddingHorizontal: 16, borderRadius: 8 }}
          >
            <Text style={{ fontSize: 16, color: "#fff", fontWeight: "bold" }}>📊 Filtros</Text>
          </TouchableOpacity>
        </View>

        <ListServicesFilters 
          visible={showFilters} 
          onClose={() => setShowFilters(false)} 
          onApplyFilters={() => {
            console.log("🔄 Recarregando ordens com filtros aplicados...")
            fetchOrders()
          }} 
        />

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
        ) : (
          <View style={{ flex: 1 }}>
            {/* Tab Buttons */}
            <View style={{ flexDirection: 'row', backgroundColor: '#fff', elevation: 2 }}>
              {routes.map((route, i) => (
                <TouchableOpacity
                  key={route.key}
                  onPress={() => setIndex(i)}
                  style={{
                    flex: 1,
                    padding: 16,
                    alignItems: 'center',
                    backgroundColor: index === i ? '#f0f8ff' : '#fff',
                    borderBottomWidth: index === i ? 2 : 0,
                    borderBottomColor: '#007AFF',
                  }}
                >
                  <Text style={{ fontSize: 16, color: index === i ? '#007AFF' : '#666', fontWeight: index === i ? 'bold' : 'normal' }}>
                    {route.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* Tab Content */}
            <View style={{ flex: 1 }}>
              {index === 0 ? <WithTripsTab orders={ordersWithTrips} /> : <WithoutTripsTab orders={ordersWithoutTrips} />}
            </View>
          </View>
        )}
      </View>
      <BottomNavigation currentScreen="ListServicesOrder" />
    </SafeAreaView>
  )
}

export default ListServicesOrder
