import React from "react"
import { View, TouchableOpacity, Text, Platform } from "react-native"
import { useNavigation } from "@react-navigation/native"

let WithLocalSvg: any = null
if (Platform.OS !== 'web') {
  try {
    WithLocalSvg = require('react-native-svg/css').WithLocalSvg
  } catch (e) {
    WithLocalSvg = null
  }
}

interface BottomNavigationProps {
  currentScreen: "ListServicesOrder" | "Routes"
}

function BottomNavigation({ currentScreen }: BottomNavigationProps) {
  const navigation = useNavigation()

  const navigateToServicesOrder = () => {
    navigation.navigate("ListServicesOrder")
  }

  const navigateToRoutes = () => {
    navigation.navigate("Routes")
  }

  return (
    <View
      style={{
        flexDirection: "row",
        height: 60,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
      }}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: currentScreen === "ListServicesOrder" ? "#f0f8ff" : "transparent",
        }}
        onPress={navigateToServicesOrder}
        activeOpacity={0.7}
      >
        {WithLocalSvg ? (
          <WithLocalSvg
            width={24}
            height={24}
            asset={require("../../assets/images/icons/factory.svg")}
            style={{ tintColor: currentScreen === "ListServicesOrder" ? "#007AFF" : "#666" }}
          />
        ) : (
          <Text style={{ color: currentScreen === "ListServicesOrder" ? "#007AFF" : "#666" }}>🏭</Text>
        )}
        <Text
          style={{
            fontSize: 12,
            marginTop: 4,
            color: currentScreen === "ListServicesOrder" ? "#007AFF" : "#666",
            fontWeight: currentScreen === "ListServicesOrder" ? "bold" : "normal",
          }}
        >
          Ordens de Serviço
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: currentScreen === "Routes" ? "#f0f8ff" : "transparent",
        }}
        onPress={navigateToRoutes}
        activeOpacity={0.7}
      >
        {WithLocalSvg ? (
          <WithLocalSvg
            width={24}
            height={24}
            asset={require("../../assets/images/icons/delivery-truck-silhouette.svg")}
            style={{ tintColor: currentScreen === "Routes" ? "#007AFF" : "#666" }}
          />
        ) : (
          <Text style={{ color: currentScreen === "Routes" ? "#007AFF" : "#666" }}>🚚</Text>
        )}
        <Text
          style={{
            fontSize: 12,
            marginTop: 4,
            color: currentScreen === "Routes" ? "#007AFF" : "#666",
            fontWeight: currentScreen === "Routes" ? "bold" : "normal",
          }}
        >
          Rotas
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default BottomNavigation
