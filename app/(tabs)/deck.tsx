import { SafeAreaView, Text, View } from "react-native";
import { CardStack } from "@/components/CardStack";
import { useChallengeStore } from "@/stores/challenges";

export default function Deck() {
  const challenges = useChallengeStore((store) => store.selectedChallenges);
  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      {challenges.length > 0 ? (
        <CardStack />
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            backgroundColor: "white",
          }}
        >
          <Text style={{ fontSize: 20, textAlign: "center", marginTop: 20 }}>
            No challenges selected. Please select some challenges to play with.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
