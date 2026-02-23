import React, { useEffect, useState } from "react"
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { SafeAreaView } from "react-native-safe-area-context"
import { WithLocalSvg } from "react-native-svg/css"

import { StackParamList } from "@/routes/stack.routes"

type HomeScreenProp = StackNavigationProp<StackParamList, "ListServicesOrder">

function Home(): JSX.Element {
  const navigation = useNavigation<HomeScreenProp>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simula um pequeno delay para carregamento
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10, color: "#666" }}>Carregando...</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <View style={{ alignItems: "center", marginBottom: 40 }}>
          <Text style={{ fontSize: 28, fontWeight: "bold", color: "#333", textAlign: "center" }}>
            eControle
          </Text>
          <Text style={{ fontSize: 16, color: "#666", textAlign: "center", marginTop: 10 }}>
            Selecione uma opção para continuar
          </Text>
        </View>

        <View style={{ width: "100%", maxWidth: 400 }}>
          {/* Botão Viagens */}
          <TouchableOpacity
            onPress={() => navigation.navigate("ListServicesOrder")}
            style={{
              backgroundColor: "#007AFF",
              padding: 20,
              borderRadius: 12,
              marginBottom: 20,
              flexDirection: "row",
              alignItems: "center",
              elevation: 3,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            }}
            activeOpacity={0.8}
          >
            <WithLocalSvg
              width={40}
              height={40}
              asset={require("../../assets/images/icons/factory.svg")}
              style={{ marginRight: 15 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: "#fff" }}>
                Viagens
              </Text>
              <Text style={{ fontSize: 14, color: "#E3F2FD", marginTop: 4 }}>
                Visualizar ordens de serviço por viagem
              </Text>
            </View>
            <Text style={{ fontSize: 24, color: "#fff" }}>›</Text>
          </TouchableOpacity>

          {/* Botão Rotas */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Routes")}
            style={{
              backgroundColor: "#0057b8",
              padding: 20,
              borderRadius: 12,
              marginBottom: 20,
              flexDirection: "row",
              alignItems: "center",
              elevation: 3,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            }}
            activeOpacity={0.8}
          >
            <WithLocalSvg
              width={40}
              height={40}
              asset={require("../../assets/images/icons/delivery-truck-silhouette.svg")}
              style={{ marginRight: 15 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: "#fff" }}>
                Rotas
              </Text>
              <Text style={{ fontSize: 14, color: "#E3F2FD", marginTop: 4 }}>
                Visualizar rotas e viagens hierárquicas
              </Text>
            </View>
            <Text style={{ fontSize: 24, color: "#fff" }}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 40, alignItems: "center" }}>
          <Text style={{ fontSize: 12, color: "#999", textAlign: "center" }}>
            Você pode alternar entre as views a qualquer momento
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Home
