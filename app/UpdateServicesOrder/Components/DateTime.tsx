import { useState } from "react"
import { Keyboard, View } from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
import moment from "moment"

import { TextButton } from "../../../components/GlobalStyles/styles"
import { CardContainer, TextBold, Header, Background, Input, Button } from "../styles"

export const DateTime = ({
  title,
  onChange,
  initialDate,
  ButtonText = "Selecione a hora",
}: any) => {
  const [selectedDate, setSelectedDate] = useState(initialDate)
  const [selectedDateInput, setSelectedDateInput] = useState<string>(
    moment(initialDate).format("HH:mm"),
  )
  const [datePickerVisible, setDatePickerVisible] = useState(false)

  const showDatePicker = () => {
    setDatePickerVisible(true)
  }

  const hideDatePicker = () => {
    setDatePickerVisible(false)
  }

  const handleConfirm = (event: any, date?: Date) => {
    console.log(date)
    setSelectedDate(date)
    setSelectedDateInput(moment(date).format("HH:mm"))
    onChange(date)
    hideDatePicker()
    Keyboard.dismiss()
  }

  const changeText = (date: any) => {
    setSelectedDateInput(date)

    onChange(moment(date, "HH:mm"))
  }

  return (
    <CardContainer style={{ marginTop: 20 }}>
      <Header>
        <TextBold>{title}</TextBold>
      </Header>
      <Background>
        <View>
          <View style={{ flexDirection: "row", flex: 1, justifyContent: "center" }}>
            <Input
              value={selectedDateInput}
              style={{ width: "50%" }}
              showSoftInputOnFocus={false}
              onFocus={showDatePicker}
            />
            <Button style={{ height: 40, marginTop: 10, marginLeft: 10 }} onPress={showDatePicker}>
              <TextButton>{ButtonText}</TextButton>
            </Button>
            {datePickerVisible && (
              <DateTimePicker
                value={selectedDate}
                mode="time"
                display="default"
                onChange={handleConfirm}
                locale="pt-BR"
                accentColor="#56d156"
              />
            )}
          </View>
        </View>
      </Background>
    </CardContainer>
  )
}

// export const DateTime = ({ title }: any) => {
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [datePickerVisible, setDatePickerVisible] = useState(false);

//   const showDatePicker = () => {
//     setDatePickerVisible(true);
//   };

//   const hideDatePicker = () => {
//     setDatePickerVisible(false);
//   };

//   const handleConfirm = (event: any, date?: Date) => {
//     if (date) {
//       setSelectedDate(date);
//     }
//     hideDatePicker();
//   };

//   return (
//     <CardContainer style={{ marginTop: 20 }}>
//       <Header>
//         <TextBold>{title}</TextBold>
//       </Header>
//       <Background>
//         <View>
//           <View
//             style={{ flexDirection: "row", flex: 1, justifyContent: "center" }}
//           >
//             <Input
//               keyboardType="numeric"
//               value={moment(selectedDate).format("DD/MM/YYYY HH:mm")}
//               style={{ width: "50%" }}
//               editable={false}
//             />
//             <Button
//               style={{ height: 40, marginTop: 10, marginLeft: 10 }}
//               onPress={showDatePicker}
//             >
//               <TextButton>Selecione a data</TextButton>
//             </Button>
//           </View>
//           {datePickerVisible && (
//             <View
//               style={{
//                 flexDirection: "row",
//                 flex: 1,
//                 justifyContent: "center",
//                 marginTop: 10,
//               }}
//             >
//               <DateTimePicker
//                 value={selectedDate}
//                 mode="datetime"
//                 display="default"
//                 onChange={handleConfirm}
//                 locale="pt-BR"
//                 accentColor="#56d156"
//               />
//             </View>
//           )}
//         </View>
//       </Background>
//     </CardContainer>
//   );
// };
