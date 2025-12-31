import styled from "styled-components/native"
import { Pressable, View, Text } from 'react-native';

export const CardContainer = styled(Pressable)`
  width: 95%;
  height: auto;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 10px;
  justify-content: center;
  background-color: #dcdcdc;
`

export const ContainerTitle = styled(View)`
  flex-direction: row;
  align-items: flex-start;
`

export const Code = styled(Text)`
  flex: 1;
  font-size: 17px;
  font-weight: 600;
  color: #56d156;
`

export const ContainerStatus = styled(View)`
  flex: 1;
  align-items: flex-end;
`

export const BackgroundStatus = styled(View)`
  height: 25px;
  width: auto;
  border-radius: 7px;
  padding: 5px;
  text-align: center;
`

export const Status = styled(Text)`
  font-weight: 500;
  flex: 1;
`

export const Description = styled(Text)`
  flex: 1;
  padding-left: 10px;
  padding-right: 10px;
  color: #111;
`
