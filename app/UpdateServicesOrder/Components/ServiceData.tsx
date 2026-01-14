import { View } from "react-native"
import moment from "moment"

import { CardContainer, TextBold, Text, Header, Background } from "../styles"
import "moment/locale/pt-br"

moment.locale("pt-br")

export const ServiceData = ({ serviceData }: any) => {
  if (!serviceData) return null
  const date = serviceData.date ? `${moment(serviceData.date).format("DD")} de ${moment(serviceData.date).format(
    "MMM",
  )} de ${moment(serviceData.date).format("YYYY")}` : ""

  return (
    <CardContainer style={{ marginTop: 20 }}>
      <Header>
        <TextBold>Dados de Serviço</TextBold>
      </Header>
      <Background>
        <View style={{ marginBottom: 10 }}>
          <TextBold>Data</TextBold>
          <Text>{date}</Text>
        </View>
        <View>
          <TextBold>Observações</TextBold>
          <Text>{serviceData.observations ?? ""}</Text>
        </View>
      </Background>
    </CardContainer>
  )
}
