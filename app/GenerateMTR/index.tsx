import React, { useRef, useState, useEffect } from "react"
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Alert, ScrollView } from "react-native"
import { Camera } from "expo-camera"
import * as ImagePicker from "expo-image-picker"
import { useNavigation, useRoute } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { StackParamList } from "@/routes/stack.routes"
import { emitirMTR, downloadMTRById } from "@/services/mtr"

type GenerateMTRScreenProp = StackNavigationProp<StackParamList, "GenerateMTR">

interface GenerateMTRRouteParams {
  orderId: number
  customerId?: string
  customerName?: string
}

function GenerateMTR(): JSX.Element {
  const navigation = useNavigation<GenerateMTRScreenProp>()
  const route = useRoute()
  const params = route.params as GenerateMTRRouteParams
  const orderId = params?.orderId

  const [photo, setPhoto] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [mtrId, setMtrId] = useState<string | null>(null)
  const cameraRef = useRef<Camera>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync()
        setHasPermission(status === "granted")
      } catch (error) {
        console.error("Error requesting camera permission:", error)
        setHasPermission(false)
      }
    })()
  }, [])

  const takePhoto = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permissão necessária", "É preciso permitir o acesso à câmera")
        return
      }

      const photoObj = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!photoObj.canceled && photoObj.assets && photoObj.assets.length > 0) {
        setPhoto(photoObj.assets[0].uri)
      }
    } catch (err) {
      console.log("takePhoto error", err)
      Alert.alert("Erro", "Falha ao tirar foto")
    }
  }

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permissão necessária", "É preciso permitir o acesso à galeria")
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhoto(result.assets[0].uri)
      }
    } catch (err) {
      console.log("pickImage error", err)
      Alert.alert("Erro", "Falha ao selecionar imagem")
    }
  }

  const retake = () => {
    setPhoto(null)
  }

  const handleEmitirMTR = async () => {
    if (!orderId) {
      Alert.alert("Erro", "ID da ordem de serviço inválido")
      return
    }

    setLoading(true)
    try {
      console.log("=== INICIANDO EMISSÃO MTR ===")
      console.log("Order ID:", orderId)
      console.log("Company ID:", params.customerId || "1")
      console.log("Tracking Code:", `OS-${orderId}`)
      
      await emitirMTR({
        companyId: params.customerId || "1",
        serviceOrderId: String(orderId),
        trackingCode: `OS-${orderId}`,
        onStart: () => {
          console.log("▶️ Iniciando emissão de MTR...")
          Alert.alert("⏳", "Emitindo MTR, aguarde...")
        },
        onSuccess: async (result) => {
          console.log("✅ MTR emitido com sucesso!", result)
          setMtrId(String(result.mtr_id))
          
          // Mostra sucesso e pergunta se quer baixar
          Alert.alert(
            "✅ MTR Emitido!",
            `ID: ${result.mtr_id}`,
            [
              {
                text: "Baixar PDF",
                onPress: async () => {
                  try {
                    console.log("📥 Baixando MTR PDF:", result.mtr_id)
                    await downloadMTRById(String(result.mtr_id), true)
                  } catch (error) {
                    console.error("❌ Erro ao baixar MTR PDF:", error)
                    Alert.alert("Erro", "Não foi possível baixar o PDF da MTR")
                  }
                },
              },
              {
                text: "Voltar",
                onPress: () => {
                  console.log("⬅️ Voltando para lista de OS")
                  navigation.navigate("ListServicesOrder")
                }
              },
            ]
          )
        },
        onError: (err) => {
          console.error("❌ ERRO NA EMISSÃO MTR:", err)
          console.error("Error details:", {
            message: err.message,
            stack: err.stack,
            name: err.name
          })
          
          let errorMessage = err.message || "Erro ao emitir MTR"
          
          // Tratamento de erros de network
          if (errorMessage.includes("Network Error") || errorMessage.includes("Network request failed")) {
            errorMessage = "Erro de conexão. Verifique:\n\n1. Se o servidor 159.89.191.25:8000 está acessível\n2. Se suas credenciais CETESB estão corretas\n3. Sua conexão com a internet"
          } else if (errorMessage.includes("Token")) {
            errorMessage = "Erro ao obter token CETESB. Verifique suas credenciais no eas.json"
          } else if (errorMessage.includes("401") || errorMessage.includes("403")) {
            errorMessage = "Erro de autenticação. Verifique suas credenciais CETESB"
          } else if (errorMessage.includes("404")) {
            errorMessage = "Endpoint não encontrado. Verifique a URL do webhook"
          } else if (errorMessage.includes("500") || errorMessage.includes("502")) {
            errorMessage = "Erro no servidor. Tente novamente em alguns instantes"
          }
          
          Alert.alert("❌ Erro", errorMessage, [
            { text: "OK" },
            { 
              text: "Tentar Novamente", 
              onPress: () => handleEmitirMTR() 
            }
          ])
        },
      })
    } catch (error: any) {
      console.error("❌ ERRO GERAL:", error)
      Alert.alert("❌ Erro", error.message || "Erro ao emitir MTR")
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadMTR = async () => {
    if (!mtrId) {
      Alert.alert("Aviso", "Emita a MTR primeiro")
      return
    }

    setLoading(true)
    try {
      console.log("📥 Baixando MTR:", mtrId)
      await downloadMTRById(mtrId, true)
    } catch (error: any) {
      console.error("❌ Erro ao baixar MTR:", error)
      Alert.alert("❌ Erro", error.message || "Erro ao baixar MTR")
    } finally {
      setLoading(false)
    }
  }

  const handleVoltar = () => {
    console.log("⬅️ Voltando para ListServicesOrder")
    navigation.navigate("ListServicesOrder")
  }

  if (hasPermission === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Solicitando permissão da câmera...</Text>
      </View>
    )
  }

  if (hasPermission === false) {
    return (
      <ScrollView contentContainerStyle={{ flex: 1, padding: 20, backgroundColor: "#fff" }}>
        <Text style={{ fontSize: 16, textAlign: "center", color: "#666" }}>
          Permissão de câmera negada. Habilite nas configurações do dispositivo.
        </Text>
        <TouchableOpacity
          onPress={handleEmitirMTR}
          style={{
            backgroundColor: "#007AFF",
            padding: 15,
            borderRadius: 8,
            marginTop: 20,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>Emitir MTR (sem foto)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleVoltar}
          style={{
            backgroundColor: "#6c757d",
            padding: 15,
            borderRadius: 8,
            marginTop: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>Voltar</Text>
        </TouchableOpacity>
      </ScrollView>
    )
  }

  return (
    <ScrollView contentContainerStyle={{ flex: 1, padding: 20, backgroundColor: "#fff", paddingTop: 40 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10, textAlign: "center" }}>
        Gerar MTR
      </Text>
      
      <Text style={{ fontSize: 14, color: "#666", marginBottom: 20, textAlign: "center" }}>
        Ordem de Serviço: #{orderId}
      </Text>

      {/* Área da imagem */}
      <View style={{ marginBottom: 20, alignItems: "center" }}>
        {photo ? (
          <Image
            source={{ uri: photo }}
            style={{ width: "100%", height: 300, borderRadius: 12, resizeMode: "cover" }}
          />
        ) : (
          <View
            style={{
              width: "100%",
              height: 300,
              borderRadius: 12,
              backgroundColor: "#f0f0f0",
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 2,
              borderColor: "#ddd",
              borderStyle: "dashed",
            }}
          >
            <Text style={{ fontSize: 40 }}>📷</Text>
            <Text style={{ fontSize: 14, color: "#999", marginTop: 10 }}>
              Nenhuma foto selecionada
            </Text>
          </View>
        )}
      </View>

      {/* Botões de ação */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
        <TouchableOpacity
          onPress={takePhoto}
          style={{
            flex: 1,
            backgroundColor: "#28a745",
            padding: 12,
            borderRadius: 8,
            marginRight: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "bold" }}>📷 Tirar Foto</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={pickImage}
          style={{
            flex: 1,
            backgroundColor: "#17a2b8",
            padding: 12,
            borderRadius: 8,
            marginLeft: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "bold" }}>🖼️ Galeria</Text>
        </TouchableOpacity>
      </View>

      {photo && (
        <TouchableOpacity
          onPress={retake}
          style={{
            backgroundColor: "#ffc107",
            padding: 12,
            borderRadius: 8,
            marginBottom: 20,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "bold" }}>🔄 Repetir Foto</Text>
        </TouchableOpacity>
      )}

      {/* Botão Emitir MTR */}
      <TouchableOpacity
        onPress={handleEmitirMTR}
        style={{
          backgroundColor: "#007AFF",
          padding: 15,
          borderRadius: 8,
          marginBottom: 10,
          alignItems: "center",
          opacity: loading ? 0.6 : 1,
        }}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>✅ Emitir MTR</Text>
        )}
      </TouchableOpacity>

      {/* Botão Download MTR (aparece após emitir) */}
      {mtrId && (
        <TouchableOpacity
          onPress={handleDownloadMTR}
          style={{
            backgroundColor: "#4CAF50",
            padding: 15,
            borderRadius: 8,
            marginBottom: 10,
            alignItems: "center",
            opacity: loading ? 0.6 : 1,
          }}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>📄 Baixar PDF</Text>
          )}
        </TouchableOpacity>
      )}

      {/* Botão Voltar */}
      <TouchableOpacity
        onPress={handleVoltar}
        style={{
          backgroundColor: "#6c757d",
          padding: 15,
          borderRadius: 8,
          marginBottom: 20,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>⬅️ Voltar</Text>
      </TouchableOpacity>

      {/* Informações adicionais */}
      <View
        style={{
          marginTop: 30,
          padding: 15,
          backgroundColor: "#f8f9fa",
          borderRadius: 8,
          borderLeftWidth: 4,
          borderLeftColor: "#007AFF",
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 5 }}>ℹ️ Informações</Text>
        <Text style={{ fontSize: 12, color: "#666", lineHeight: 18 }}>
          • A MTR será emitida usando as credenciais CETESB configuradas{"\n"}
          • O PDF será gerado automaticamente após a emissão{"\n"}
          • A foto é opcional e serve como comprovante adicional{"\n"}
          • Servidor: 159.89.191.25:8000
        </Text>
      </View>
    </ScrollView>
  )
}

export default GenerateMTR
