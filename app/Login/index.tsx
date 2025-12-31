import React from "react"
import { Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"

import { DefaultButton } from "../../components/Button"
import { Logo, Container, Input } from "../../components/GlobalStyles/styles"
import { StackParamList } from "../../routes/stack.routes"
import login from "../../services/login"

type ServicesOrderScreenProp = StackNavigationProp<StackParamList, "ListServicesOrder">

function Login(): JSX.Element {
  const navigation = useNavigation<ServicesOrderScreenProp>()
  const [email, onChangeEmail] = React.useState("motoristaaplicativo@econtrole.com")
  const [password, onChangePassword] = React.useState("motorapp123")
  const [loading, setLoading] = React.useState(false)

  const submit = async () => {
    try {
      setLoading(true)
      const response: any = await login(email, password)

      if (response?.status === 200) {
        setLoading(false)
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
    </Container>
  )
}

export default Login
