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
import { Platform } from "react-native"

let WithLocalSvg: any = null
if (Platform.OS !== 'web') {
  try {
    WithLocalSvg = require('react-native-svg/css').WithLocalSvg
  } catch (e) {
    WithLocalSvg = null
  }
}

import { useFilterServiceOrderStore } from "@/stores/useFilterServiceOrder"
import { getServicesOrders } from "@/services/servicesOrders"

import BottomNavigation from "../../components/BottomNavigation"

const isRoutesScreen = (route: any) => route.name === "Routes"

interface VoyageGroup {
  tripName: string
  orders: any[]
  collectionPoints: number
  totalDistance?: string
  completionRate?: number
}

interface RouteGroup {
  routeName: string
  voyages: VoyageGroup[]
}

function Routes(): JSX.Element {
  const navigation = useNavigation()
  const [trips, setTrips] = useState<RouteGroup[]>([])
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
      // Normalizo os formatos de resposta (axios response, wrapped data, etc.)
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
        const groupedByRoute = groupOrdersByRouteAndTrips(ordersData)
        setTrips(groupedByRoute as any)
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

  // Agrupo primeiro por rota (collection route / route.name) depois por viagem/voyage
  const groupOrdersByRouteAndTrips = (orders: any[]): RouteGroup[] => {
    if (!Array.isArray(orders)) {
      console.log('groupOrdersByRouteAndTrips received non-array orders:', orders)
      return []
    }

    const routeMap: { [key: string]: any[] } = {}

    orders.forEach(order => {
      const routeName = order.collection_route || order.route?.name || 'Rota não definida'
      const enhancedOrder = {
        ...order,
        hasCollectionPoints: !!(order.address?.latitude && order.address?.longitude),
        estimatedDistance: order.estimated_distance || null,
      }
      if (!routeMap[routeName]) routeMap[routeName] = []
      routeMap[routeName].push(enhancedOrder)
    })

    // Para cada rota, agrupo ordens por viagem/trip
    const routeGroups: RouteGroup[] = Object.entries(routeMap).map(([routeName, ordersForRoute]) => {
      const tripMap: { [key: string]: any[] } = {}
      ordersForRoute.forEach(o => {
        // Tento obter o nome da viagem/voyage
        const tripName = o.voyage?.name || 'Sem Viagem'
        
        if (!tripMap[tripName]) tripMap[tripName] = []
        tripMap[tripName].push(o)
      })

      const voyages: VoyageGroup[] = Object.entries(tripMap).map(([tripName, voyageOrders]) => {
        const collectionPoints = voyageOrders.filter((order: any) => order.hasCollectionPoints).length
        return {
          tripName,
          orders: voyageOrders,
          collectionPoints,
          totalDistance: calculateTotalDistance(voyageOrders),
          completionRate: calculateCompletionRate(voyageOrders),
        }
      }).sort((a, b) => b.orders.length - a.orders.length)

      return { routeName, voyages }
    })

    return routeGroups
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

  // Renderizo uma caixa de rota contendo viagens
  const renderRouteItem = ({ item }: { item: RouteGroup }) => (
    <View style={{ width: "100%", marginBottom: 20 }}>
      <View style={{ backgroundColor: "#0057b8", borderRadius: 12, padding: 12, marginBottom: 10 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "#fff" }}>{item.routeName}</Text>
      </View>

      {/* For each voyage under the route render a compact trip card */}
      {item.voyages.map((voyage) => (
        <View key={voyage.tripName} style={{ marginBottom: 12 }}>
          <View style={{ backgroundColor: "#007AFF", borderRadius: 10, padding: 12, marginBottom: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: "#fff" }}>{voyage.tripName}</Text>
                <Text style={{ fontSize: 12, color: "#E3F2FD" }}>{voyage.orders.length} ordens</Text>
              </View>
              <View style={{ backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6 }}>
                <Text style={{ fontSize: 12, color: "#fff", fontWeight: "bold" }}>{voyage.collectionPoints} pontos</Text>
              </View>
            </View>
          </View>

          <View style={{ paddingLeft: 8 }}>
            {voyage.orders.slice(0, 3).map((order, idx) => (
              <View key={order.id || idx} style={{ backgroundColor: "#f8f9fa", borderRadius: 8, padding: 10, marginBottom: 8, borderLeftWidth: 4, borderLeftColor: order.hasCollectionPoints ? "#28a745" : "#ffc107" }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={{ fontSize: 14, fontWeight: "bold", color: "#333" }}>#{order.identifier || `OS-${order.id}`}</Text>
                  <View style={{ backgroundColor: order.status === 'completed' ? "#28a745" : "#007bff", borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 }}>
                    <Text style={{ fontSize: 10, color: "#fff", fontWeight: "bold" }}>{order.status === 'completed' ? 'CONCLUÍDA' : 'PENDENTE'}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{order.customer?.name || "Cliente não informado"}</Text>
                <Text style={{ fontSize: 11, color: "#999", marginTop: 6 }}>📍 {order.address?.to_s || "Endereço não informado"}</Text>
              </View>
            ))}

            {voyage.orders.length > 3 && <Text style={{ fontSize: 12, color: "#007AFF", textAlign: "center", marginTop: 8 }}>... e mais {voyage.orders.length - 3} ordens</Text>}
          </View>
        </View>
      ))}
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
            {WithLocalSvg ? (
              <WithLocalSvg width={80} height={80} asset={require("../../assets/images/icons/delivery-truck-silhouette.svg")} />
            ) : (
              <Text style={{ fontSize: 48 }}>🚚</Text>
            )}
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
            keyExtractor={(item, index) => `${item.routeName}-${index}`}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={refreshTripsList} />
            }
            renderItem={renderRouteItem}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
      <BottomNavigation currentScreen="Routes" />
    </SafeAreaView>
  )
}

export default Routes
