import { useEffect } from "react"
import { Slot } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import * as SplashScreen from "expo-splash-screen"

import { initDatabase } from "../databases/database"

console.log("ROOT_LAYOUT_LOADED: Starting boot sequence...")

export default function RootLayout() {
  useEffect(() => {
    console.log("ROOT_LAYOUT_EFFECT: Initializing Database...")
    try {
      // Initialize local database schema (expo-sqlite)
      initDatabase()
      console.log("ROOT_LAYOUT_EFFECT: DB Initialized")
    } catch (error) {
      console.log("ROOT_LAYOUT_EFFECT: DB Fatal Error:", error)
    }

    // Hide splash screen
    SplashScreen.hideAsync()
  }, [])

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Slot />
    </SafeAreaView>
  )
}
