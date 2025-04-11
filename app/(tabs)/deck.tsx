import { SafeAreaView, Text } from "react-native";
import { CardStack } from "@/components/CardStack";

export default function Deck() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <CardStack size={30} />
    </SafeAreaView>
  );
}
