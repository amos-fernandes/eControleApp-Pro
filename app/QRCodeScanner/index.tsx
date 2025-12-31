import React, { useRef, useState, useEffect } from "react"
import { View, StyleSheet, Button, Text } from "react-native"
import { Camera, CameraType, CameraView } from "expo-camera"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"

import { retrieveDomain } from "@/services/retrieveUserSession"
import { SaveDataToSecureStore } from "@/utils/SecureStore"

import { StackParamList } from "../../routes/stack.routes"

type authScreenProp = StackNavigationProp<StackParamList, "AuthenticationScreen">

function QRCode(): JSX.Element {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [scanned, setScanned] = useState(false)
  const cameraRef = useRef<CameraType | null>(null)
  const navigation = useNavigation<authScreenProp>()

  useEffect(() => {
    ; (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync()
      setHasPermission(status === "granted")
    })()
  }, [])

  const handleBarCodeScanned = async ({ type, data }: { type: any; data: string }) => {
    setScanned(true)

    try {
      let extracted = data

      // Caso: deep link do Expo dev client com query param `url=` (ex: exp+econtrole://.../?url=http%3A%2F%2F192.168...)
      try {
        const urlObj = new URL(data)
        const params = new URLSearchParams(urlObj.search)
        if (params.has("url")) {
          const decoded = decodeURIComponent(params.get("url") || "")
          if (decoded) extracted = decoded
        }
      } catch (err) {
        // data pode não ser uma URL completa — ignore
      }

      // Normaliza: remove espaços e quebras
      extracted = extracted.trim()

      // Salva como objeto esperado por retrieveDomain
      await SaveDataToSecureStore("domain", JSON.stringify({ domain: extracted }))

      const session = await retrieveDomain()
      console.log("handleBarCodeScanned: ", session)

      if (session && session.status === 200) {
        navigation.navigate("Login")
      }
    } catch (err) {
      console.log("QRCode handling error:", err)
      setScanned(false)
    }
  }

  if (hasPermission === null) {
    return <View />
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>
  }

  return (
    <View style={styles.container}>
      <CameraView
        // ref={cameraRef}
        style={styles.camera}
        // type={CameraType.back}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      >
        <View style={styles.buttonContainer}>
          {scanned && (
            <Button title={"click para escanear novamente"} onPress={() => setScanned(false)} />
          )}
        </View>
      </CameraView>
    </View>
  )
}

const styles = StyleSheet.create({
  buttonContainer: {
    backgroundColor: "transparent",
    flexDirection: "row",
    margin: 20,
  },
  camera: {
    flex: 1,
    justifyContent: "flex-end",
    width: "100%",
  },
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
})

export default QRCode
