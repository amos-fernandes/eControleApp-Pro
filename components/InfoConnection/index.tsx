import { Text, View } from "react-native"

function InfoConnection(): JSX.Element {
  return (
    <View
      style={{
        backgroundColor: "rgba(255,15,15, 0.726)",
        height: 30,
        marginTop: 160,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700" }}>
        Você está sem internet.
      </Text>
    </View>
  )
}

export default InfoConnection
