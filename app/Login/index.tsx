import React from "react"
import { Alert, TouchableOpacity, View, Text } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"

import { DefaultButton } from "../../components/Button"
import { Logo, Container, Input } from "../../components/GlobalStyles/styles"
import { StackParamList } from "../../routes/stack.routes"
import login from "../../services/login"
import { DeleteDataFromSecureStore, GetDataFromSecureStore } from "@/utils/SecureStore"

type ServicesOrderScreenProp = StackNavigationProp<StackParamList, "ListServicesOrder">

function Login(): JSX.Element {
  const navigation = useNavigation<ServicesOrderScreenProp>()
  const [email, onChangeEmail] = React.useState("motoristaaplicativo@econtrole.com")
  const [password, onChangePassword] = React.useState("motoapp123")
  const [loading, setLoading] = React.useState(false)

  const submit = async () => {
    try {
      setLoading(true)
      const response: any = await login(email, password)

      if (response?.status === 200) {
        setLoading(false)
        try {
          const redirect = await GetDataFromSecureStore("redirect_path")
          if (redirect && typeof redirect === "string") {
            // Caso conhecido: /operacional/viagens -> abrir tela de Rotas/Viagens
            if (redirect.includes("operacional") && redirect.includes("viagens")) {
              navigation.navigate("Routes")
              return
            }
          }
        } catch (err) {
          console.log("Error reading redirect_path:", err)
        }

        navigation.navigate("ListServicesOrder")
      } else {
        Alert.alert("Verifique as credenciais se estão corretas e tente novamente.")
      }
    } catch (error: any) {
      console.log("Login Error: ", error)
      if (error.message === "Network Error") {
        Alert.alert("Erro de Conexao", "Verifique se voce escaneou o QR Code correto do Cliente, e nao o QR Code do terminal da Expo.")
      } else {
        Alert.alert("Ocorreu um erro desconhecido. Tente novamente mais tarde.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container>
      <Logo source={require("../../assets/images/logo_econtrole_residuo4.png")} />
      <Input
        style={{
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          color: "#777",
        }}
        onChangeText={onChangeEmail}
        placeholder={"Email"}
        placeholderTextColor={"#777"}
        value={email}
      />
      <Input
        style={{
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
          color: "#777",
        }}
        onChangeText={onChangePassword}
        placeholder={"Senha"}
        secureTextEntry={true}
        placeholderTextColor={"#777"}
        value={password}
      />
      <DefaultButton onPress={() => submit()} title={"ENTRAR"} loading={loading} />
      <View style={{ marginTop: 12, alignItems: "center" }}>
        <TouchableOpacity
          onPress={async () => {
            await DeleteDataFromSecureStore("domain")
            await DeleteDataFromSecureStore("user_session")
            Alert.alert("Sessão limpa", "Dados locais removidos. Escaneie o QR novamente.")
          }}
        >
          <Text style={{ color: "#007AFF", marginTop: 8 }}>Limpar sessão local</Text>
        </TouchableOpacity>
      </View>
    </Container>
  )
}

export default Login
