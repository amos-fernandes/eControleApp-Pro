import React from "react"
import { AppRoutes } from "@/routes/stack.routes"

// expo-router already provides a NavigationContainer at the app root.
// Do not wrap navigators with another NavigationContainer to avoid nesting.
export default function App() {
  return <AppRoutes />
}
