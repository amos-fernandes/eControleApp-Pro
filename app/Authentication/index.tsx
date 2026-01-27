import React from "react"
import { useRouter } from "expo-router"
import { WithLocalSvg } from "react-native-svg/css"

import { QRCodeButton } from "./styles"
import { Container, TextButton, Logo } from "../../components/GlobalStyles/styles"

function Authentication(): JSX.Element {
  const router = useRouter()

  const submit = async () => {
    try {
      router.push("/QRCodeScanner")
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Container>
      <Logo source={require("../../assets/images/logo_econtrole_residuo4.png")} />

      <QRCodeButton style={({ pressed }) => pressed ? { opacity: 0.5 } : {}} onPress={() => submit()}>
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
