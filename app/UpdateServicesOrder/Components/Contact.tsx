import { View } from "react-native"

import { CardContainer, TextBold, Text, Header, Background, ContainerText } from "../styles"

export const Contact = ({ contact }: any) => {
  return (
    <CardContainer style={{ marginTop: 20 }}>
      <Header>
        <TextBold>Contato</TextBold>
      </Header>
      <Background>
        <ContainerText>
          <View>
            <TextBold>Nome</TextBold>
            <Text>{contact?.name}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <TextBold>Cargo</TextBold>
            <Text>{contact?.position}</Text>
          </View>
        </ContainerText>
        <View>
          <TextBold>Telefone</TextBold>
          {/* formatar */}
          <Text>{contact?.telephone}</Text>
        </View>
      </Background>
    </CardContainer>
  )
}
