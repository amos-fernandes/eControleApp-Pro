import React from "react"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { WithLocalSvg } from "react-native-svg/css"

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

  return (
    <Container>
      <Logo source={require("../../assets/images/logo_econtrole_residuo4.png")} />

      <QRCodeButton activeOpacity={0.5} onPress={() => submit()}>
        <WithLocalSvg
          width="65%"
          height="65%"
          style={{ marginVertical: 10 }}
          asset={require("../../assets/images/icons/qr-code.svg")}
        />

        <TextButton>Entre com QRCode</TextButton>
      </QRCodeButton>
    </Container>
  )
}

export default Authentication
