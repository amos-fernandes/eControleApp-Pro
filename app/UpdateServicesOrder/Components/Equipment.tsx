import { useCallback, useState } from "react"
import { View, TouchableOpacity } from "react-native"
import { useFocusEffect } from "@react-navigation/native"
import { MultipleSelectList } from "react-native-dropdown-select-list"

import { getCredentials } from "@/databases/database"
import { getEquipamentsCollected, getEquipamentsLeft } from "@/services/equipaments"
import checkConnection from "@/utils/checkConnection"

import { CardContainer, TextBold, Text, Header, Background } from "../styles"

export const Equipment = ({ customerId, onChangeLeft, onChangeCollected }: any) => {
  const connection: boolean = checkConnection()
  const [selectedCollected, setSelectedCollected] = useState([])
  const [selectedLeft, setSelectedLeft] = useState([])
  const [equipamentsCollected, setEquipamentsCollected] = useState([])
  const [equipamentsLeft, setEquipamentsLeft] = useState([])
  const [show, setShow] = useState(false)
  const arrEquipaments: any = []
  let equipmentCollectedInClientArr: any = []
  let equipmentLeftInClientArr: any = []
  const newArrEquipments: any = []

  const equipmentLeftInClient = async () => {
    if (connection) {
      equipmentLeftInClientArr = await getEquipamentsLeft(customerId, true)
    } else {
      // Para modo offline, podemos armazenar localmente os equipamentos
      // mas por enquanto vamos apenas tratar como online
      equipmentLeftInClientArr = await getEquipamentsLeft(customerId, false)
    }

    if (equipmentLeftInClientArr) {
      equipmentLeftInClientArr?.items?.map((equipament: any) => {
        arrEquipaments.push({
          key: equipament.id,
          value: `${equipament.equipment_type} - ${equipament.current_customer.name}`,
        })
      })
      setEquipamentsLeft(arrEquipaments)
    }
  }

  const equipmentCollectedInClient = async () => {
    if (connection) {
      equipmentCollectedInClientArr = await getEquipamentsCollected(customerId, false)
    } else {
      // Para modo offline, podemos armazenar localmente os equipamentos
      // mas por enquanto vamos apenas tratar como online
      equipmentCollectedInClientArr = await getEquipamentsCollected(customerId, false)
    }

    if (equipmentCollectedInClientArr) {
      equipmentCollectedInClientArr?.items?.map((equipament: any) => {
        arrEquipaments.push({
          key: equipament.id,
          value: `${equipament.equipment_type} - ${equipament.current_customer.name}`,
        })
      })
      setEquipamentsCollected(arrEquipaments)
    }
  }

  const onChangeSelectedCollected = (equipments: string[]) => {
    if (equipments && equipments.length > 0) {
      for (const equipment of equipments) {
        const found = equipmentCollectedInClientArr.item.filter(
          (element: any) =>
            `${element.equipment_type} - ${element.current_customer.name}` === equipment,
        )
        newArrEquipments.push(found)
      }
      onChangeCollected(newArrEquipments)
    }
  }

  const onChangeSelectedLeft = (equipments: string[]) => {
    if (equipments && equipments.length > 0) {
      for (const equipment of equipments) {
        const found = equipmentLeftInClientArr.items.filter(
          (element: any) =>
            `${element.equipment_type} - ${element.current_customer.name}` === equipment,
        )
        newArrEquipments.push(found)
      }
      onChangeLeft(newArrEquipments)
    }
  }

  useFocusEffect(
    useCallback(() => {
      equipmentLeftInClient()
      equipmentCollectedInClient()
    }, [customerId]),
  )

  return (
    <CardContainer style={{ marginTop: 20 }}>
      <Header>
        <TextBold>Equipamentos</TextBold>
      </Header>
      <Background>
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, marginBottom: 10 }}>Coletados</Text>
          <MultipleSelectList
            setSelected={(val: string[]) => {
              setSelectedCollected(val)
              onChangeSelectedCollected(val)
            }}
            data={equipamentsCollected}
            save="value"
            label="Selecione os equipamentos coletados"
            placeholder="Selecione os equipamentos"
            searchPlaceholder="Buscar equipamentos..."
            maxHeight={150}
            disabled={!connection}
          />
        </View>
        <View>
          <Text style={{ fontSize: 16, marginBottom: 10 }}>Deixados</Text>
          <MultipleSelectList
            setSelected={(val: string[]) => {
              setSelectedLeft(val)
              onChangeSelectedLeft(val)
            }}
            data={equipamentsLeft}
            save="value"
            label="Selecione os equipamentos deixados"
            placeholder="Selecione os equipamentos"
            searchPlaceholder="Buscar equipamentos..."
            maxHeight={150}
            disabled={!connection}
          />
        </View>
      </Background>
    </CardContainer>
  )
}