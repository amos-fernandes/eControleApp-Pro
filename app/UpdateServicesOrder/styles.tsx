import { Dimensions } from "react-native"
import styled from "styled-components/native"

export const Container = styled.View`
  flex: 1;
  align-items: center;
  background-color: #fff;
`

export const Header = styled.View`
  width: 100%;
  height: 40px;
  margin-top: 10px;
  padding-left: 10px;
  justify-content: center;
`

export const CardContainer = styled.View`
  width: ${Dimensions.get("window").width - 25}px;
  height: auto;
  border-radius: 10px;
  align-items: center;
  justify-content: center;
  background-color: #dcdcdc;
`

export const Background = styled.View`
  width: 95%;
  height: auto;
  padding: 20px;
  background-color: #fff;
  justify-content: center;
  margin-bottom: 10px;
  border-radius: 10px;
`

export const Text = styled.Text`
  margin-bottom: 7px;
  font-size: 16px;
  color: #333;
`

export const TextBold = styled.Text`
  font-weight: 600;
  margin-bottom: 10px;
  font-size: 17px;
`

export const ContainerText = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding-top: 10px;
  padding-bottom: 10px;
`

export const Input = styled.TextInput`
  width: 95%;
  height: 40px;
  border-width: 2px;
  border-color: #bbb;
  border-radius: 5px;
  margin-top: 10px;
  padding-left: 10px;
  padding-right: 10px;
`

export const Button = styled.Pressable`
  width: 50%;
  height: 45px;
  background-color: #56d156;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
`
