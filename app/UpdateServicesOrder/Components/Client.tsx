import { View } from "react-native"

import { CardContainer, TextBold, Text, Header, Background } from "../styles"

export const Client = ({ client }: any) => {
  return (
    <CardContainer style={{ marginTop: 20 }}>
      <Header>
        <TextBold>Cliente</TextBold>
      </Header>
      <Background>
        <View>
          <TextBold>Nome</TextBold>
          <Text>{client?.business_name ? client?.business_name : client?.name}</Text>
        </View>
        <View>
          <TextBold>CNPJ</TextBold>
          {/* formatar */}
          <Text>{client?.document_value}</Text>
        </View>
      </Background>
    </CardContainer>
  )
}
