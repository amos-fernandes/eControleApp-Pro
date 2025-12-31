import React, { useState } from "react"
import { Text, View, TouchableOpacity } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { WithLocalSvg } from "react-native-svg/css"

import {
  ContainerTitle,
  Code,
  ContainerStatus,
  Status,
  Description,
  CardContainer,
  BackgroundStatus,
} from "./styles"
import { StackParamList } from "../../routes/stack.routes"

type ServicesOrderScreenProp = StackNavigationProp<StackParamList, "ListServicesOrder">

function Card({ cardData }: { cardData: any[] }) {
  const navigation = useNavigation<ServicesOrderScreenProp>()
  const [isExpanded, setIsExpanded] = useState(true)

  // Get voyage name from first order or use "Sem Viagem" if none
  const voyageName = cardData?.[0]?.voyage?.name || "Sem Viagem"
  const orderCount = cardData?.length || 0

  const getStatusText = (status: string) => {
    switch (status) {
      case "checking":
        return "Em conferência"
      case "started":
        return "Iniciada"
      case "completed":
        return "Concluída"
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "checking":
        return "#ffac14"
      case "started":
        return "#56d156"
      case "completed":
        return "#007AFF"
      default:
        return "#999"
    }
  }

  return (
    <View style={{ width: "100%", marginBottom: 15 }}>
      {/* Voyage Header */}
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          borderRadius: 10,
          height: 60,
          marginBottom: 8,
          backgroundColor: "#56d156",
          paddingHorizontal: 15,
        }}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={1}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <WithLocalSvg
            width={24}
            height={24}
            style={{ marginRight: 12 }}
            asset={isExpanded 
              ? require("@/assets/images/icons/arrow_left.svg")
              : require("@/assets/images/icons/arrow_down.svg")
            }
          />
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#fff", flex: 1 }}>
            {voyageName}
          </Text>
        </View>
        <View style={{
          backgroundColor: "rgba(255,255,255,0.2)",
          borderRadius: 15,
          paddingHorizontal: 10,
          paddingVertical: 5,
          marginLeft: 10
        }}>
          <Text style={{ fontSize: 12, color: "#fff", fontWeight: "bold" }}>
            {orderCount} {orderCount === 1 ? "ordem" : "ordens"}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Service Orders */}
      {isExpanded && cardData?.map((order: any, index: number) => (
        <CardContainer 
          key={order.id || index} 
          onPress={() => navigation.navigate("UpdateServicesOrder", order)}
        >
          <ContainerTitle>
            <Code>#{order.identifier || `OS-${order.id}`}</Code>
            <ContainerStatus>
              <BackgroundStatus
                style={{
                  backgroundColor: getStatusColor(order.status),
                }}
              >
                <Status>{getStatusText(order.status)}</Status>
              </BackgroundStatus>
            </ContainerStatus>
          </ContainerTitle>
          
          <View>
            <ContainerTitle style={{ marginTop: 10 }}>
              <WithLocalSvg width="10%" height="100%" asset={require("@/assets/images/icons/factory.svg")} />
              <Description numberOfLines={2}>
                {order.customer?.name || order.customer?.business_name || "Cliente não informado"}
              </Description>
            </ContainerTitle>
          </View>
          
          <View>
            <ContainerTitle style={{ marginTop: 10 }}>
              <WithLocalSvg width="10%" height="100%" asset={require("@/assets/images/icons/delivery-truck-silhouette.svg")} />
              <Description numberOfLines={2}>
                {order.address?.to_s || order.address?.street || "Endereço não informado"}
              </Description>
            </ContainerTitle>
          </View>

          {order.service_date && (
            <View>
              <ContainerTitle style={{ marginTop: 10 }}>
                <Text style={{ fontSize: 12, color: "#666" }}>
                  📅 Data: {new Date(order.service_date).toLocaleDateString('pt-BR')}
                </Text>
              </ContainerTitle>
            </View>
          )}
        </CardContainer>
      ))}
    </View>
  )
}

export default Card
