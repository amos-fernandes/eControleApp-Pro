import { useCallback, useState } from "react"
import { View, TouchableOpacity } from "react-native"
import { useFocusEffect } from "@react-navigation/native"
import { MultipleSelectList } from "react-native-dropdown-select-list"

import { getRealm } from "@/databases/realm"
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
    const realm = await getRealm()

    if (connection) {
      equipmentLeftInClientArr = await getEquipamentsLeft(customerId, true)
    } else {
      try {
        const equipaments: any = realm
          .objects("EquipamentLeft")
          .filtered(`current_customer_id = '${customerId}'`)
        if (equipaments.length > 0) {
          // data = equipaments
        }
      } catch (error) {
        console.log(error)
      }
      // finally {
      //   realm.close();
      // }
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
    const realm = await getRealm()

    if (connection) {
      equipmentCollectedInClientArr = await getEquipamentsCollected(customerId, false)
    } else {
      try {
        const equipaments: any = realm
          .objects("EquipamentCollected")
          .filtered(`current_customer_id = '${customerId}'`)
        if (equipaments.length > 0) {
          equipmentCollectedInClientArr = equipaments
        }
      } catch (error) {
        console.log(error)
      }
      // finally {
      //   realm.close();
      // }
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
        const found = equipmentCollectedInClientArr.item.filter(
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
      equipmentCollectedInClient()
      equipmentLeftInClient()
    }, [connection]),
  )

  return (
    <CardContainer style={{ marginTop: 20 }}>
      <Header>
        <TouchableOpacity onPress={() => setShow(!show)}>
          <TextBold>Equipamentos</TextBold>
        </TouchableOpacity>
      </Header>
      {show && (
        <Background>
          <View style={{ marginVertical: 20 }}>
            <TextBold>Equipamentos deixados no Cliente</TextBold>
            <Text>Nenhuma movimentação de equipamento.</Text>
            <MultipleSelectList
              setSelected={(value: any) => setSelectedCollected(value)}
              onSelect={() => onChangeSelectedCollected(selectedCollected)}
              data={equipmentLeftInClientArr}
              save="value"
              inputStyles={{ fontSize: 20 }}
              dropdownTextStyles={{ fontSize: 17 }}
              placeholder="Buscar equipamentos..."
              label="Equipamentos"
              notFoundText="Nenhum equipamento foi encontrado."
            />
          </View>
          <View>
            <TextBold>Equipamentos coletados no Cliente</TextBold>
            <Text>Nenhuma movimentação de equipamento.</Text>
            <MultipleSelectList
              setSelected={(value: any) => setSelectedLeft(value)}
              onSelect={() => onChangeSelectedLeft(selectedLeft)}
              data={equipmentCollectedInClientArr}
              inputStyles={{ fontSize: 20 }}
              dropdownTextStyles={{ fontSize: 17 }}
              save="value"
              placeholder="Buscar equipamentos.."
              label="Equipamentos"
              notFoundText="Nenhum equipamento foi encontrado."
            />
          </View>
        </Background>
      )}
    </CardContainer>
  )
}

// export const Equipment = () => {
//   const [selected, setSelected] = useState([]);
//   const [show, setShow] = useState(false);
//   const data = [
//     { key: '1', value: 'Mobiles', disabled: true },
//     { key: '2', value: 'Appliances' },
//     { key: '3', value: 'Cameras' },
//     { key: '4', value: 'Computers', disabled: true },
//     { key: '5', value: 'Vegetables' },
//     { key: '6', value: 'Diary Products' },
//     { key: '7', value: 'Drinks' },
//   ]

//   return (
//     <CardContainer style={{ marginTop: 20 }}>
//       <Header>
//         <TouchableOpacity onPress={() => setShow(!show)}>
//           <TextBold>Equipamentos</TextBold>
//         </TouchableOpacity>
//       </Header>
//       {show &&
//         <Background>
//           <View style={{ marginVertical: 20 }}>
//             <TextBold >Equipamentos deixados no Cliente</TextBold>
//             <Text>Nenhuma movimentação de equipamento.</Text>
//             <MultipleSelectList
//               setSelected={(val: any) => setSelected(val)}
//               data={data}
//               save="value"
//               placeholder='Buscar equipamentos..'
//               onSelect={() => console.log(selected)}
//               label="Categories"
//             />
//           </View>
//           <View >
//             <TextBold >Equipamentos coletados no Cliente</TextBold>
//             <Text >Nenhuma movimentação de equipamento.</Text>
//             <MultipleSelectList
//               setSelected={(val: any) => setSelected(val)}
//               data={data}
//               save="value"
//               placeholder='Buscar equipamentos..'
//               onSelect={() => console.log(selected)}
//               label="Categories"
//             />
//           </View>
//         </Background>
//       }
//     </CardContainer>
//   )
// }
