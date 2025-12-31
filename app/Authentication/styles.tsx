import styled from "styled-components/native"
import { Pressable } from 'react-native';



//export const QRCodeButton = styled.Pressable`


export const QRCodeButton = styled(Pressable)`
  height: 25%;
  width: 50%;
  background-color: #56d156;
  padding-left: 10px;
  padding-right: 10px;
  margin-top: 20px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
`

export const SkipButton = styled(Pressable)`
  height: 10%;
  width: 50%;
  background-color: #ffa500;
  padding-left: 10px;
  padding-right: 10px;
  margin-top: 20px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
`
