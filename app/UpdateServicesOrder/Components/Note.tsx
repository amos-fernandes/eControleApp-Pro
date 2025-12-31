import { useState } from "react"

import { CardContainer, TextBold, Header, Background, Input } from "../styles"

export const Note = ({ notes, onChange }: any) => {
  return (
    <CardContainer style={{ marginTop: 20 }}>
      <Header>
        <TextBold>Observações do Motorista</TextBold>
      </Header>
      <Background>
        <Input
          value={notes}
          onChangeText={onChange}
          multiline={true}
          style={{ width: "100%", height: 90, fontSize: 20 }}
        />
      </Background>
    </CardContainer>
  )
}
