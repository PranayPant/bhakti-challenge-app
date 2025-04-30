import { SafeAreaView, Text, View } from "react-native";
import { CardStack } from "@/components/CardStack";
import { useChallengeStore } from "@/stores/challenges";

export default function Deck() {
  const challenges = useChallengeStore((store) => store.selectedChallenges);
  return (
    <SafeAreaView className="flex-1">
      {challenges.length > 0 ? (
        <CardStack />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-center text-gray-500">
            No challenges selected. Please select some challenges to play with.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
