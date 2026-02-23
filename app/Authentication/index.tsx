import React from "react"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { Platform, Text } from "react-native"

let WithLocalSvg: any = null
if (Platform.OS !== 'web') {
  try {
    WithLocalSvg = require('react-native-svg/css').WithLocalSvg
  } catch (e) {
    WithLocalSvg = null
  }
}

import { QRCodeButton } from "./styles"
import { Container, TextButton, Logo } from "../../components/GlobalStyles/styles"
import { StackParamList } from "../../routes/stack.routes"

type authScreenProp = StackNavigationProp<StackParamList, "AuthenticationScreen">

function Authentication(): JSX.Element {
  const navigation = useNavigation<authScreenProp>()

  const submit = async () => {
    try {
      navigation.navigate("QRCode")
    } catch (error) {
      console.log(error)
    }
  }

  const goToLogin = async () => {
    try {
      navigation.navigate("Login")
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Container>
      <Logo source={require("../../assets/images/logo_econtrole_residuo4.png")} />

      <QRCodeButton activeOpacity={0.5} onPress={() => submit()}>
        {WithLocalSvg ? (
          <WithLocalSvg width="65%" height="65%" style={{ marginVertical: 10 }} asset={require("../../assets/images/icons/qr-code.svg")} />
        ) : (
          <Text style={{ fontSize: 44, marginVertical: 10 }}>🔍</Text>
        )}

        <TextButton>Entre com QRCode</TextButton>
      </QRCodeButton>

      <QRCodeButton 
        activeOpacity={0.5} 
        onPress={() => goToLogin()}
        style={{ marginTop: 20, backgroundColor: '#f0f0f0' }}
      >
        
      </QRCodeButton>
    </Container>
  )
}

export default Authentication
