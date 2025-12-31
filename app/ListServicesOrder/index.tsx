import { useCallback, useEffect, useState } from "react"
import {
  View,
  ScrollView,
  BackHandler,
  Text,
  RefreshControl,
  ActivityIndicator,
  FlatList,
} from "react-native"
import { useFocusEffect, useRoute } from "@react-navigation/native"
import { useNavigation } from "@react-navigation/native"
import { SafeAreaView } from "react-native-safe-area-context"

import { useFilterServiceOrderStore } from "@/stores/useFilterServiceOrder";
import { getServicesOrders } from "@/services/servicesOrders"

import Card from "../../components/Card"
import BottomNavigation from "../../components/BottomNavigation"

const isListServicesOrderScreen = (route: any) => route.name === "ListServicesOrder"

function ListServicesOrder(): JSX.Element {
  const navigation = useNavigation()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { filters } = useFilterServiceOrderStore()

  const fetchOrders = async (_filters?: any) => {
    setLoading(true)
    setError(null)
    try {
      const response = await getServicesOrders({ filters })
      if (response?.data) {
        setOrders(response.data)
      } else {
        setOrders([])
      }
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

  // Group orders by voyage
  const groupOrdersByVoyage = (orders: any[]) => {
    const grouped = orders.reduce((acc, order) => {
      const voyageName = order.voyage?.name || "Sem Viagem"
      if (!acc[voyageName]) {
        acc[voyageName] = []
      }
      acc[voyageName].push(order)
      return acc
    }, {})
    return grouped
  }

  const groupedOrders = groupOrdersByVoyage(orders)
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
        ) : orders.length === 0 ? (
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
    </SafeAreaView>
  )
}

export default ListServicesOrder
