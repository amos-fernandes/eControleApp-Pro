import { StyleSheet, View, Pressable, TextInput, Text, Image } from "react-native"
import styled from "styled-components/native"

export const styles = StyleSheet.create({
  dropShadow: {
    elevation: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.43,

    shadowRadius: 9.51,
  },
})

export const Container = styled(View)`
  width: 100%;
  height: 100%;
  align-items: center;
  margin-top: 100px;
`

export const Button = styled(Pressable)`
  height: 50px;
  width: 80%;
  background-color: #56d156;
  padding-left: 10px;
  padding-right: 10px;
  margin-top: 20px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
`
export const OutlinedButton = styled(Pressable)`
  height: 50px;
  width: 80%;
  padding-left: 10px;
  padding-right: 10px;
  /* margin-top: 20px; */
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background-color: #fff;
  border-color: #56d156;
  border-width: 2px;
  color: #56d156;
`

export const TextButton = styled(Text)`
  color: #fff;
  font-weight: 700;
  font-size: 20px;
`

export const Input = styled(TextInput)`
  height: 70px;
  width: 80%;
  font-size: 17px;
  background-color: #5e4a4aff;
  padding-left: 20px;
  padding-right: 20px;
  margin-bottom: 5px;
`

export const Logo = styled(Image)`
  width: 200px;
  height: 150px;
  margin-bottom: 20px;
  object-fit: stretch;
`
