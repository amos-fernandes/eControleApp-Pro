import { useEffect, useState } from "react"
import { View } from "react-native"

import { Input, Text, TextBold } from "../styles"

const Serviceitem = ({
  id,
  teste,
  name,
  unit,
  unitValue,
  index,
  changeText,
  amount = false,
}: any) => {
  const [value, setValue] = useState(unitValue)

  const onChangeValue = (value: string) => {
    changeText(index, parseInt(value), unit, id)
    setValue(value)
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "space-between",
        marginBottom: 20,
      }}
    >
      <TextBold style={{ marginBottom: 20 }}>{name}</TextBold>
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
          key={index}
          value={value}
          onChangeText={onChangeValue}
          style={{
            width: "30%",
            textAlign: "center",
            marginTop: 0,
            fontSize: 20,
          }}
        />
      </View>
    </View>
  )
}

export default Serviceitem
