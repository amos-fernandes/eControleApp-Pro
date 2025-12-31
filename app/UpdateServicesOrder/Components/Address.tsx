import { Linking, View } from "react-native"

import { TextButton } from "../../../components/GlobalStyles/styles"
import { CardContainer, TextBold, Text, Header, Background, ContainerText, Button } from "../styles"

export const Address = ({ address }: any) => {
  const URL = `https://www.google.com.br/maps/@${address.latitude},${address.longitude},17z?hl=pt-PT`

  return (
    <CardContainer style={{ marginTop: 20 }}>
      <Header>
        <TextBold>Endereço de Origem</TextBold>
      </Header>
      <Background>
        <TextBold style={{ marginBottom: 20 }}>{address.neighborhood}</TextBold>
        <ContainerText>
          <View>
            <TextBold style={{ fontSize: 16 }}>Logradouro</TextBold>
            <Text>{address.street}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <TextBold style={{ fontSize: 16 }}>Número</TextBold>
            <Text>{address.number}</Text>
          </View>
        </ContainerText>
        <ContainerText>
          <View>
            <TextBold style={{ fontSize: 16 }}>Complemento</TextBold>
            <Text>{address.complement}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <TextBold style={{ fontSize: 16 }}>Localidade</TextBold>
            <Text>{address.address_location?.name}</Text>
          </View>
        </ContainerText>
        <ContainerText>
          <View>
            <TextBold style={{ fontSize: 16 }}>Estado</TextBold>
            <Text>{address.address_location?.state_abbreviation}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <TextBold style={{ fontSize: 16 }}>Bairro</TextBold>
            <Text>{address.neighborhood}</Text>
          </View>
        </ContainerText>
        <ContainerText>
          <View>
            <TextBold style={{ fontSize: 16 }}>Ponto de referência</TextBold>
            <Text>{address.landmark}</Text>
          </View>
        </ContainerText>
        <View style={{ alignItems: "flex-end" }}>
          <Button onPress={() => Linking.openURL(URL)}>
            <TextButton>Localização</TextButton>
          </Button>
        </View>
      </Background>
    </CardContainer>
  )
}
