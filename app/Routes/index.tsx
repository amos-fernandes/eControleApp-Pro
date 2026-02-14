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
import { WithLocalSvg } from "react-native-svg/css"

import { useFilterServiceOrderStore } from "@/stores/useFilterServiceOrder"
import { getServicesOrders } from "@/services/servicesOrders"

import BottomNavigation from "../../components/BottomNavigation"

const isRoutesScreen = (route: any) => route.name === "Routes"

interface TripGroup {
  tripName: string
  orders: any[]
  collectionPoints: number
  totalDistance?: string
  completionRate: number
}

function Routes(): JSX.Element {
  const navigation = useNavigation()
  const [trips, setTrips] = useState<TripGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { filters } = useFilterServiceOrderStore()

  const fetchTrips = async (_filters?: any) => {
    setLoading(true)
    setError(null)
    try {
      const response: any = await getServicesOrders({ filters })
      console.log("fetchTrips response shape:", response && Object.keys(response))
      if (response && response.data) {
        try {
          console.log("fetchTrips response.data shape:", Object.keys(response.data))
        } catch (e) {
          console.log("fetchTrips response.data (non-object)")
        }
      }
      // Normalize response shapes (axios response, wrapped data, etc.)
      let ordersData: any[] = []
      if (!response) {
        ordersData = []
      } else if (Array.isArray(response.data)) {
        ordersData = response.data
      } else if (response.data && Array.isArray(response.data.data)) {
        ordersData = response.data.data
      } else if (response.data && Array.isArray(response.data.items)) {
        ordersData = response.data.items
      } else if (response.data && Array.isArray(response.data.service_orders)) {
        ordersData = response.data.service_orders
      } else if (Array.isArray(response)) {
        ordersData = response
      } else {
        const maybeArray = Object.values(response).find((v: any) => Array.isArray(v))
        ordersData = Array.isArray(maybeArray) ? maybeArray : []
      }

      if (Array.isArray(ordersData) && ordersData.length > 0) {
        const groupedTrips = groupOrdersByTripsAndRoutes(ordersData)
        setTrips(groupedTrips)
      } else {
        setTrips([])
      }
    } catch (error: any) {
      console.log("Fetch trips error:", error)
      setError("Erro ao carregar rotas e viagens")
      setTrips([])
    } finally {
      setLoading(false)
    }
  }

  const route = useRoute()
  const handleBackButton = () => {
    if (isRoutesScreen(route)) {
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
    fetchTrips(filters)
  }, [filters])

  const refreshTripsList = () => {
    fetchTrips(filters)
  }

  // Enhanced grouping logic for trips and routes
  const groupOrdersByTripsAndRoutes = (orders: any[]): TripGroup[] => {
    if (!Array.isArray(orders)) {
      console.log('groupOrdersByTripsAndRoutes received non-array orders:', orders)
      return []
    }

    const tripGroups: { [key: string]: any[] } = {}

    orders.forEach(order => {
      // Try to get trip/voyage name and date
      const tripName = order.voyage?.name || "Viagens sem Agrupamento"
      const routeDate = order?.route_date || order?.voyage?.date || null
      const groupName = routeDate ? `${tripName} (${new Date(routeDate).toLocaleDateString('pt-BR')})` : tripName

      if (!tripGroups[groupName]) {
        tripGroups[groupName] = []
      }

      // Add collection route information if available
      const enhancedOrder = {
        ...order,
        collectionRoute: order.collection_route || order.route?.name || "Rota não definida",
        hasCollectionPoints: !!(order.address?.latitude && order.address?.longitude),
        estimatedDistance: order.estimated_distance || null,
        serviceTime: order.estimated_service_time || null
      }

      tripGroups[groupName].push(enhancedOrder)
    })

    // Convert to TripGroup format with additional metrics
    return Object.entries(tripGroups).map(([groupName, orders]) => {
      const collectionPoints = orders.filter(order => order.hasCollectionPoints).length
      const totalOrders = orders.length

      return {
        tripName: groupName,
        orders,
        collectionPoints,
        totalDistance: calculateTotalDistance(orders),
        completionRate: calculateCompletionRate(orders)
      }
    }).sort((a, b) => b.orders.length - a.orders.length) // Sort by number of orders
  }

  const calculateTotalDistance = (orders: any[]): string => {
    if (!Array.isArray(orders) || orders.length === 0) return "Não calculado"
    const totalDistance = orders.reduce((sum, order) => {
      return sum + (parseFloat(order.estimatedDistance) || 0)
    }, 0)
    return totalDistance > 0 ? `${totalDistance.toFixed(1)} km` : "Não calculado"
  }

  const calculateCompletionRate = (orders: any[]): number => {
    if (!Array.isArray(orders) || orders.length === 0) return 0
    const completedOrders = orders.filter(order => order.status === 'completed').length
    return Math.round((completedOrders / orders.length) * 100)
  }

  const renderTripItem = ({ item }: { item: TripGroup }) => (
    <View style={{ width: "100%", marginBottom: 20 }}>
      {/* Trip Header */}
      <TouchableOpacity
        style={{
          backgroundColor: "#007AFF",
          borderRadius: 12,
          padding: 16,
          marginBottom: 8,
        }}
        onPress={() => {}}
        activeOpacity={1}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#fff", marginBottom: 4 }}>
              {item.tripName}
            </Text>
            <Text style={{ fontSize: 14, color: "#E3F2FD" }}>
              {item.orders.length} ordens de serviço
            </Text>
          </View>
          <View style={{
            backgroundColor: "rgba(255,255,255,0.2)",
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 6,
          }}>
            <Text style={{ fontSize: 12, color: "#fff", fontWeight: "bold" }}>
              {item.collectionPoints} pontos
            </Text>
          </View>
        </View>

        {/* Trip Metrics */}
        <View style={{ flexDirection: "row", marginTop: 12, justifyContent: "space-between" }}>
          <View style={{ alignItems: "center" }}>
            <WithLocalSvg
              width={20}
              height={20}
              asset={require("../../assets/images/icons/delivery-truck-silhouette.svg")}
            />
            <Text style={{ fontSize: 12, color: "#fff", marginTop: 2 }}>
              {item.totalDistance}
            </Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "#fff" }}>
              {item.completionRate}%
            </Text>
            <Text style={{ fontSize: 12, color: "#E3F2FD" }}>
              Concluído
            </Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <WithLocalSvg
              width={20}
              height={20}
              asset={require("../../assets/images/icons/factory.svg")}
            />
            <Text style={{ fontSize: 12, color: "#fff", marginTop: 2 }}>
              {item.orders.filter(o => o.customer).length} clientes
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Orders List */}
      <View style={{ paddingLeft: 16 }}>
        {item.orders.slice(0, 3).map((order, index) => (
          <View
            key={order.id || index}
            style={{
              backgroundColor: "#f8f9fa",
              borderRadius: 8,
              padding: 12,
              marginBottom: 8,
              borderLeftWidth: 4,
              borderLeftColor: order.hasCollectionPoints ? "#28a745" : "#ffc107",
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 14, fontWeight: "bold", color: "#333" }}>
                #{order.identifier || `OS-${order.id}`}
              </Text>
              <View style={{
                backgroundColor: order.status === 'completed' ? "#28a745" : "#007bff",
                borderRadius: 12,
                paddingHorizontal: 8,
                paddingVertical: 2,
              }}>
                <Text style={{ fontSize: 10, color: "#fff", fontWeight: "bold" }}>
                  {order.status === 'completed' ? 'CONCLUÍDA' : 'PENDENTE'}
                </Text>
              </View>
            </View>

            <Text style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
              {order.customer?.name || "Cliente não informado"}
            </Text>

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
              <Text style={{ fontSize: 11, color: "#999" }}>
                📍 {order.address?.to_s || "Endereço não informado"}
              </Text>
              {order.hasCollectionPoints && (
                <Text style={{ fontSize: 11, color: "#28a745", fontWeight: "bold" }}>
                  ✓ Com GPS
                </Text>
              )}
            </View>
          </View>
        ))}

        {item.orders.length > 3 && (
          <Text style={{ fontSize: 12, color: "#007AFF", textAlign: "center", marginTop: 8 }}>
            ... e mais {item.orders.length - 3} ordens
          </Text>
        )}
      </View>
    </View>
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: "#333", marginBottom: 4 }}>
            Rotas e Viagens
          </Text>
          <Text style={{ fontSize: 14, color: "#666" }}>
            Gerencie suas viagens e rotas de coleta
          </Text>
        </View>

        {loading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={{ marginTop: 10, color: "#666" }}>Carregando rotas e viagens...</Text>
          </View>
        ) : error ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
            <Text style={{ fontSize: 16, color: "red", textAlign: "center" }}>{error}</Text>
            <Text style={{ fontSize: 14, color: "#666", textAlign: "center", marginTop: 10 }}>
              Verifique sua conexão e tente novamente
            </Text>
          </View>
        ) : trips.length === 0 ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: 20,
            }}
          >
            <WithLocalSvg
              width={80}
              height={80}
              asset={require("../../assets/images/icons/delivery-truck-silhouette.svg")}
            />
            <Text style={{ fontSize: 18, color: "#666", textAlign: "center", marginTop: 16 }}>
              Nenhuma rota encontrada
            </Text>
            <Text style={{ fontSize: 14, color: "#999", textAlign: "center", marginTop: 8 }}>
              Não há viagens ou rotas disponíveis no momento
            </Text>
          </View>
        ) : (
          <FlatList
            data={trips}
            keyExtractor={(item, index) => `${item.tripName}-${index}`}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={refreshTripsList} />
            }
            renderItem={renderTripItem}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
      <BottomNavigation currentScreen="Routes" />
    </SafeAreaView>
  )
}

export default Routes