import React from "react"
import { AppRoutes } from "@/routes/stack.routes"

// O expo-router já fornece um NavigationContainer na raiz do app.
// Não envolvo os navegadores com outro NavigationContainer para evitar aninhamento.
export default function App() {
  return <AppRoutes />
}
