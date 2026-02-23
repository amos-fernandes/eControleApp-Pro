import { useEffect, useState } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { SafeAreaView } from "react-native-safe-area-context"
import * as SplashScreen from "expo-splash-screen"

import { initDatabase } from "../databases/database"
import { AppRoutes } from "@/routes/stack.routes"

console.log("ROOT_LAYOUT_LOADED: Starting boot sequence...")

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const initializeApp = async () => {
      console.log("ROOT_LAYOUT_EFFECT: Initializing Database...")
      try {
        // Initialize local database schema (expo-sqlite)
        await initDatabase()
        console.log("ROOT_LAYOUT_EFFECT: DB Initialized")
      } catch (error) {
        console.log("ROOT_LAYOUT_EFFECT: DB Fatal Error:", error)
      }

      // Hide splash screen
      await SplashScreen.hideAsync()
      setIsReady(true)
    }

    initializeApp()
  }, [])

  if (!isReady) {
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
