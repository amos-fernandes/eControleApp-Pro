import React, { useRef, useState, useEffect } from "react"
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Alert } from "react-native"
// use require to tolerate different module shapes in the dev-client runtime
const CameraModule: any = require("expo-camera")
const CameraComp: any = CameraModule?.Camera || CameraModule?.default || CameraModule
import { useNavigation, useRoute } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { StackParamList } from "@/routes/stack.routes"
import generateMTR from "@/services/mtr"

type GenerateMTRScreenProp = StackNavigationProp<StackParamList, "GenerateMTR">

function GenerateMTR(): JSX.Element {
  const navigation = useNavigation<GenerateMTRScreenProp>()
  const route = useRoute()
  const params: any = (route as any).params || {}
  const orderId: number = params.orderId

  const [photo, setPhoto] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isPreview, setIsPreview] = useState(false)
  const cameraRef = useRef<any>(null)

  useEffect(() => {
    ;(async () => {
      const { status } = await CameraModule.requestCameraPermissionsAsync()
      setHasPermission(status === "granted")
    })()
  }, [])

  const takePhoto = async () => {
    if (!cameraRef.current) return
    try {
      const photoObj = await cameraRef.current.takePictureAsync({ quality: 0.7 })
      setPhoto(photoObj.uri)
      setIsPreview(true)
    } catch (err) {
      console.log("takePhoto error", err)
      Alert.alert("Erro", "Falha ao tirar foto")
    }
  }

  const retake = () => {
    setPhoto(null)
    setIsPreview(false)
  }

  const submit = async () => {
    if (!orderId) {
      Alert.alert("Erro", "Pedido inválido para gerar MTR")
      return
    }
    if (!photo) {
      Alert.alert("Foto necessária", "Tire uma foto antes de gerar o MTR")
      return
    }
    setLoading(true)
    try {
      const response: any = await generateMTR(orderId, photo, {})
      if (response?.status === 200 || response?.status === 201) {
        Alert.alert("Sucesso", "MTR gerado com sucesso")
        navigation.goBack()
      } else {
        Alert.alert("Erro", "Falha ao gerar MTR")
      }
    } catch (error) {
      console.log("generateMTR error", error)
      Alert.alert("Erro", "Falha ao gerar MTR")
    } finally {
      setLoading(false)
    }
  }

  if (hasPermission === null) {
    return <View><Text>Solicitando permissão da câmera...</Text></View>
  }
  if (hasPermission === false) {
    return <View style={{ padding: 16 }}><Text>Permissão de câmera negada. Habilite nas configurações.</Text></View>
  }

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#fff", paddingTop: 40 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>Gerar MTR</Text>
      <Text style={{ marginBottom: 8 }}>Pedido ID: {orderId}</Text>

      <View style={{ marginBottom: 12 }}>
        {photo ? (
          <Image source={{ uri: photo }} style={{ width: "100%", height: 360, borderRadius: 8 }} />
        ) : (
              <CameraComp ref={cameraRef} style={{ width: "100%", height: 360, borderRadius: 8 }} ratio="16:9" />
        )}
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
        {!isPreview ? (
          <TouchableOpacity onPress={takePhoto} style={{ flex: 1, backgroundColor: "#28a745", padding: 12, borderRadius: 8 }}>
            <Text style={{ color: "#fff", textAlign: "center" }}>Tirar Foto</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={retake} style={{ flex: 1, backgroundColor: "#ffc107", padding: 12, borderRadius: 8 }}>
            <Text style={{ color: "#fff", textAlign: "center" }}>Repetir</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity onPress={submit} style={{ backgroundColor: "#56d156", padding: 14, borderRadius: 8 }} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}>Gerar MTR</Text>}
      </TouchableOpacity>
    </View>
  )
}

export default GenerateMTR
