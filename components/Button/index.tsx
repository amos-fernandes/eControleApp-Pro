import { ActivityIndicator, GestureResponderEvent } from "react-native"

import { Button, TextButton } from "../GlobalStyles/styles"

interface DefaultButtonInterface {
  onPress: (event: GestureResponderEvent) => void
  title: string
  loading?: boolean
}

export const DefaultButton = ({ onPress, title, loading }: DefaultButtonInterface): JSX.Element => {
  return (
    <Button style={({ pressed }) => pressed ? { opacity: 0.5 } : {}} onPress={onPress} disabled={loading}>
      {loading ? <ActivityIndicator color="#fff" /> : <TextButton>{title}</TextButton>}
    </Button>
  )
}
