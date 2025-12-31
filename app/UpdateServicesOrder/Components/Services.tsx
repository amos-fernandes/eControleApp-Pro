import { View } from "react-native"

import { CardContainer, TextBold, Text, Header, Background, Input } from "../styles"
import Serviceitem from "./ServiceItem"
import ServiceitemWeight from "./ServiceItemWeight"

export const Services = ({ services, onChange, idService, values }: any) => {
  const changeText = (
    key: number,
    unit: number,
    name: string,
    id: string,
    amount: boolean,
    serviceItemWeight: number,
  ) => {
    onChange({
      key,
      unit,
      name,
      idItems: id,
      amount,
      id: idService,
      serviceItemWeight,
    })
  }

  return (
    <>
      <CardContainer style={{ marginTop: 20 }}>
        <Header>
          <TextBold>Serviços</TextBold>
        </Header>
        {services?.map((service: any, index: any) => (
          <Background key={index}>
            {service.service_item_weights ? (
              <ServiceitemWeight
                name={service.service.name}
                serviceItemWeight={service.service.id}
                serviceItems={service.service.service_items}
                unit={service?.unit?.name}
                unitValue={values[index]?.service_item_weights}
                changeText={changeText}
              />
            ) : (
              <Serviceitem
                id={service?.service?.id}
                teste={service}
                name={service.service.name}
                unit={service?.unit?.name}
                unitValue={values[index]?.amount}
                index={index}
                changeText={changeText}
              />
            )}

            {service.service.mtr_tipo_acondicionamento !== null ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ width: "60%" }}>Tipo de Acondicionamento</Text>
                <Input
                  value={service.service.mtr_tipo_acondicionamento}
                  style={{
                    textAlign: "center",
                    width: "40%",
                    marginTop: 0,
                    fontSize: 20,
                  }}
                />
              </View>
            ) : null}
          </Background>
        ))}
      </CardContainer>
    </>
  )
}
