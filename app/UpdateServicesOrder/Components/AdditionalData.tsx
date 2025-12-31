import { useState } from "react"
import { View, TouchableOpacity } from "react-native"

import { CardContainer, TextBold, Text, Header, Background, Input } from "../styles"

export const AdditionalData = ({
  onChangeStart,
  onChangeEnd,
  onChangeCertificate,
  startKM,
  endKM,
  certificate,
}: any) => {
  const [show, setShow] = useState(false)
  return (
    <CardContainer style={{ marginTop: 20 }}>
      <Header>
        <TouchableOpacity onPress={() => setShow(!show)}>
          <TextBold>Dados adicionais</TextBold>
        </TouchableOpacity>
      </Header>
      {show && (
        <Background style={{ marginBottom: 0 }}>
          <View style={{ paddingVertical: 10 }}>
            <Text>Quilometro de saída</Text>
            <Input
              keyboardType="numeric"
              value={startKM?.toString() || ""}
              style={{ fontSize: 20 }}
              onChangeText={onChangeStart}
            />
          </View>
          <View>
            <Text>Quilometro de chegada</Text>
            <Input
              keyboardType="numeric"
              value={endKM?.toString() || ""}
              style={{ fontSize: 20 }}
              onChangeText={onChangeEnd}
            />
          </View>
          <View style={{ paddingVertical: 10 }}>
            <Text>Observação no Certificado</Text>
            <Input
              value={certificate || ""}
              onChangeText={onChangeCertificate}
              multiline={true}
              style={{ height: 90, fontSize: 20 }}
            />
          </View>
        </Background>
      )}
    </CardContainer>
  )
}
