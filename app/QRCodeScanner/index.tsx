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
        // data pode não ser uma URL completa — ignoro
      }

      // Normalizo: removo espaços e quebras
      extracted = extracted.trim()

      // Se for uma URL completa, extraio origin e possível redirect_url
      try {
        const u = new URL(extracted)

        // Se a URL escaneada já é o host alvo, salvo imediatamente
        if (u.hostname.includes("econtrole.com")) {
          const origin = u.origin
          await SaveDataToSecureStore("domain", JSON.stringify({ domain: origin }))
          const redirectParam = u.searchParams.get("redirect_url")
          if (redirectParam) {
            const decoded = decodeURIComponent(redirectParam)
            await SaveDataToSecureStore("redirect_path", decoded)
          }
        } else {
          // Para hosts conhecidos de wrapper/shortener, tento resolver sincronamente com timeout
          const wrapperRegex = /qr-code-generator|qrco\.de|bit\.ly|tinyurl|support\.qr-code-generator|go\.qr-code-generator/gi
          if (wrapperRegex.test(u.hostname)) {
            const controller = new AbortController()
            const timeout = setTimeout(() => controller.abort(), 2500)
            try {
              const resp = await fetch(extracted, { method: "GET", redirect: "follow", signal: (controller as any).signal })
              clearTimeout(timeout)
              const final = resp.url || extracted
              if (final && final.includes("econtrole.com")) {
                const fu = new URL(final)
                const finalOrigin = fu.origin
                await SaveDataToSecureStore("domain", JSON.stringify({ domain: finalOrigin }))
                const redirectParam2 = fu.searchParams.get("redirect_url")
                if (redirectParam2) {
                  await SaveDataToSecureStore("redirect_path", decodeURIComponent(redirectParam2))
                }
                console.log("QRCode resolution: updated domain to final origin", finalOrigin)
              } else {
                // Se o redirect não expôs o host final, tento inspecionar o HTML pelo link final
                try {
                  const text = await resp.text()
                  const m = text.match(/https?:\/\/(?:[\w.-]*\.)?econtrole\.com[\S]*/i)
                  if (m && m[0]) {
                    try {
                      const fu2 = new URL(m[0])
                      const finalOrigin2 = fu2.origin
                      await SaveDataToSecureStore("domain", JSON.stringify({ domain: finalOrigin2 }))
                      const redirectParam3 = fu2.searchParams.get("redirect_url")
                      if (redirectParam3) await SaveDataToSecureStore("redirect_path", decodeURIComponent(redirectParam3))
                      console.log("QRCode resolution: extracted econtrole link from HTML and saved", finalOrigin2)
                    } catch (e) {
                      await SaveDataToSecureStore("domain", JSON.stringify({ domain: extracted }))
                    }
                  } else {
                    await SaveDataToSecureStore("domain", JSON.stringify({ domain: extracted }))
                  }
                } catch (e) {
                  await SaveDataToSecureStore("domain", JSON.stringify({ domain: extracted }))
                }
              }
            } catch (e) {
              clearTimeout(timeout)
              // falha na resolução (cloudflare/challenge) — faço fallback salvando a origin escaneada
              await SaveDataToSecureStore("domain", JSON.stringify({ domain: u.origin }))
            }
          } else {
            // Host não-wrapper: salvo a origin como está
            await SaveDataToSecureStore("domain", JSON.stringify({ domain: u.origin }))
            const redirectParam = u.searchParams.get("redirect_url")
            if (redirectParam) {
              const decoded = decodeURIComponent(redirectParam)
              await SaveDataToSecureStore("redirect_path", decoded)
            }
          }
        }
      } catch (err) {
        // Não é uma URL completa — mantenho comportamento anterior
        await SaveDataToSecureStore("domain", JSON.stringify({ domain: extracted }))
      }

      // Após salvar domínio/redirect, navego para a tela de Login
      console.log("handleBarCodeScanned: domain saved")
      navigation.navigate("Login")
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
