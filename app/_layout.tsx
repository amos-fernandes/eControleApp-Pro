import { useEffect, useState } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { SafeAreaView } from "react-native-safe-area-context"
import * as SplashScreen from "expo-splash-screen"

import { initDatabase } from "../databases/database"
import { Platform } from "react-native"
import { SaveDataToSecureStore } from "@/utils/SecureStore"
import { AppRoutes } from "@/routes/stack.routes"

console.log("ROOT_LAYOUT_LOADED: Starting boot sequence...")

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const initializeApp = async () => {
      console.log("ROOT_LAYOUT_EFFECT: Initializing Database...")
      try {
        // Inicializo o schema do banco de dados local (SQLite)
        await initDatabase()
        console.log("ROOT_LAYOUT_EFFECT: DB Initialized")
      } catch (error) {
        console.log("ROOT_LAYOUT_EFFECT: DB Fatal Error:", error)
      }

      // Se estiver rodando na web, pré-populo o domínio para que a web possa conectar diretamente
      if (Platform.OS === "web") {
        try {
          const domainPayload = JSON.stringify({ domain: "https://testeaplicativo.econtrole.com/login?redirect_url=%2Foperacional%2Fviagens" })
          SaveDataToSecureStore("domain", domainPayload)
          // Também salvo o caminho de redirecionamento para navegação após login
          SaveDataToSecureStore("redirect_path", "/operacional/viagens")
          console.log("ROOT_LAYOUT_EFFECT: Web domain prefilled")
        } catch (e) {
          console.warn("ROOT_LAYOUT_EFFECT: failed to prefill web domain", e)
        }
      }

      // Escondo a splash screen
      await SplashScreen.hideAsync()
      setIsReady(true)
    }

    initializeApp()
  }, [])

  if (!isReady) {
    // Retorno null enquanto inicializo
    return null
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NavigationContainer>
        <AppRoutes />
      </NavigationContainer>
    </SafeAreaView>
  )
}
