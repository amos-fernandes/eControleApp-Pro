import { Linking, View } from "react-native"

import { TextButton } from "../../../components/GlobalStyles/styles"
import { CardContainer, TextBold, Text, Header, Background, ContainerText, Button } from "../styles"

export const Address = ({ address }: any) => {
  // Corrige latitude/longitude null ou undefined
  const lat = address?.latitude || address?.lat
  const lng = address?.longitude || address?.lng || address?.longitude
  
  const hasValidCoordinates = lat && lng && 
                              parseFloat(lat) !== 0 && 
                              parseFloat(lng) !== 0
  
  const URL = hasValidCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    : null

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
          {URL ? (
            <Button onPress={() => Linking.openURL(URL)}>
              <TextButton>📍 Localização</TextButton>
            </Button>
          ) : (
            <Text style={{ fontSize: 12, color: "#999", fontStyle: "italic" }}>
              Coordenadas não disponíveis
            </Text>
          )}
        </View>
      </Background>
    </CardContainer>
  )
}
