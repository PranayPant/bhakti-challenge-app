import { View, Text } from "react-native";

function StartScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fecaca",
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>
        Welcome to the Start Screen
      </Text>
      <Text style={{ marginTop: 16, color: "#4b5563" }}>
        This is the start screen of your app.
      </Text>
    </View>
  );
}

export default StartScreen;
