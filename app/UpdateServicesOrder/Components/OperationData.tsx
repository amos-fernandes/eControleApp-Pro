import { View } from "react-native"

import { CardContainer, TextBold, Text, Header, Background } from "../styles"

export const OperationData = ({ vehicle, employees, voyage }: any) => {
  return (
    <CardContainer style={{ marginTop: 20 }}>
      <Header>
        <TextBold>Dados de Operação</TextBold>
      </Header>
      <Background>
        <TextBold>Transporte</TextBold>
        <View style={{ marginBottom: 10 }}>
          <TextBold>Veículo</TextBold>
          <Text>
            {vehicle?.model} - {vehicle?.registration_plate} ({vehicle?.vehicle_manufacturer?.name})
          </Text>
        </View>
        <View>
          <TextBold>Capacidade</TextBold>
          <Text>{vehicle?.capacity}</Text>
        </View>
      </Background>
      <Background>
        <TextBold>Funcionários</TextBold>
        <View style={{ marginBottom: 10 }}>
          {employees?.map((employee: any, key: number) => (
            <Text key={key}>
              {employee?.name} - {employee?.position?.name}
            </Text>
          ))}
        </View>
      </Background>
      {voyage ? (
        <Background>
          <TextBold>Viagem</TextBold>
          <View style={{ marginBottom: 10 }}>
            <Text>{voyage.name}</Text>
          </View>
        </Background>
      ) : null}
    </CardContainer>
  )
}
