import { useEffect, useState } from "react"
import { View } from "react-native"

import { Input, Text, TextBold } from "../styles"

const ServiceitemWeight = ({
  serviceItems,
  unit,
  unitValue,
  changeText,
  amount = true,
  serviceItemWeight,
}: any) => {
  const [values, setValues] = useState<string[]>([])

  useEffect(() => {
    if (unitValue && Object.keys(unitValue).length > 0) {
      const newValues = serviceItems.map((serviceItem: any) => {
        const itemId = serviceItem.id.toString()
        return unitValue[itemId] !== undefined ? unitValue[itemId].toString() : "0"
      })
      setValues(newValues)
    } else {
      setValues(serviceItems.map(() => "0"))
    }
  }, [unitValue, serviceItems])

  const onChangeValue = (value: string, key: number, serviceItemId: number) => {
    const updatedValues = [...values]
    updatedValues[key] = value
    setValues(updatedValues)
    changeText(key, parseInt(value), unit, serviceItemId, amount, serviceItemWeight)
  }
  return serviceItems.map((serviceItem: any, key: number) => (
    <View
      key={key}
      style={{
        flex: 1,
        justifyContent: "space-between",
        marginBottom: 20,
      }}
    >
      <TextBold style={{ marginBottom: 20 }}>{serviceItem.name}</TextBold>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text>{unit}(s)</Text>
        <Input
          keyboardType="numeric"
          key={key}
          value={values[key]}
          onChangeText={(value: string) => onChangeValue(value, key, serviceItem.id)}
          style={{
            width: "30%",
            textAlign: "center",
            marginTop: 0,
            fontSize: 20,
          }}
        />
      </View>
    </View>
  ))
}

export default ServiceitemWeight
