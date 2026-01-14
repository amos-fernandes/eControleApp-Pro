import { useEffect, useState } from "react"
import { Slot } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import * as SplashScreen from "expo-splash-screen"

import { initDatabase } from "../databases/database"
import { Platform } from "react-native"
import { SaveDataToSecureStore } from "@/utils/SecureStore"

console.log("ROOT_LAYOUT_LOADED: Starting boot sequence...")

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const initializeApp = async () => {
      console.log("ROOT_LAYOUT_EFFECT: Initializing Database...")
      try {
        // Initialize local database schema (Realm)
        await initDatabase()
        console.log("ROOT_LAYOUT_EFFECT: DB Initialized")
      } catch (error) {
        console.log("ROOT_LAYOUT_EFFECT: DB Fatal Error:", error)
      }

      // If running on web, pre-populate domain so web can connect directly
      if (Platform.OS === "web") {
        try {
          const domainPayload = JSON.stringify({ domain: "https://testeaplicativo.econtrole.com/login?redirect_url=%2Foperacional%2Fviagens" })
          SaveDataToSecureStore("domain", domainPayload)
          // Also save redirect path for login navigation
          SaveDataToSecureStore("redirect_path", "/operacional/viagens")
          console.log("ROOT_LAYOUT_EFFECT: Web domain prefilled")
        } catch (e) {
          console.warn("ROOT_LAYOUT_EFFECT: failed to prefill web domain", e)
        }
      }

      // Hide splash screen
      await SplashScreen.hideAsync()
      setIsReady(true)
    }

    initializeApp()
  }, [])

  if (!isReady) {
    // Return null while initializing
    return null
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Slot />
    </SafeAreaView>
  )
}
