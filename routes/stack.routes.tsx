import React from "react"
import { Platform } from "react-native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import AuthOrApp from "@/app/AuthOrApp"
import ListServicesOrder from "@/app/ListServicesOrder"
import Login from "@/app/Login"
import QRCode from "@/app/QRCodeScanner"
import Routes from "@/app/Routes"
import UpdateServicesOrder from "@/app/UpdateServicesOrder"
import GenerateMTR from "../app/GenerateMTR"

import { ServicesOrderInterface } from "../interfaces/ServicesOrder"

export type StackParamList = {
  AuthOrApp: undefined
  AuthenticationScreen: undefined
  Login: undefined
  QRCode: undefined
  ListServicesOrder: undefined
  Routes: { voyageName?: string } | undefined
  GenerateMTR: { orderId: number } | undefined
  UpdateServicesOrder: ServicesOrderInterface
}

const Stack = createNativeStackNavigator<StackParamList>()

export function AppRoutes() {
  const initial = Platform.OS === 'web' ? 'Login' : 'AuthOrApp'
  return (
    <Stack.Navigator initialRouteName={initial}>
      <Stack.Screen name="AuthOrApp" component={AuthOrApp} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      <Stack.Screen
        name="ListServicesOrder"
        component={ListServicesOrder}
        options={{
          title: "Ordens de Serviço",
          headerTitleAlign: "center",
          headerTransparent: true,
          headerStyle: { backgroundColor: "#fff" },
        }}
      />
      <Stack.Screen
        name="Routes"
        component={Routes}
        options={{
          title: "Rotas e Viagens",
          headerTitleAlign: "center",
          headerTransparent: true,
          headerStyle: {
            backgroundColor: "#fff",
          },
        }}
      />
      <Stack.Screen
        name="UpdateServicesOrder"
        component={UpdateServicesOrder}
        options={{
          // headerShown: false,
          title: "Dados Ordens de Serviço",
          headerTitleAlign: "center",
          headerTransparent: true,
          headerStyle: {
            backgroundColor: "#fff",
          },
        }}
      />
      <Stack.Screen
        name="GenerateMTR"
        component={GenerateMTR}
        options={{
          title: "Gerar MTR",
          headerTitleAlign: "center",
          headerTransparent: true,
          headerStyle: { backgroundColor: "#fff" },
        }}
      />
      <Stack.Screen name="QRCode" component={QRCode} options={{ headerShown: false }} />
    </Stack.Navigator>
  )
}
