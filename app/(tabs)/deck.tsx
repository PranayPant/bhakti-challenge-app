import { Pressable, SafeAreaView, Text, View } from "react-native";
import { CardStack } from "@/components/CardStack";
import { useChallengeStore } from "@/stores/challenges";

export default function Deck() {
  const challenges = useChallengeStore((store) => store.selectedChallengesData);
  const language = useChallengeStore((store) => store.language);
  const toggleLanguage = useChallengeStore((store) => store.toggleLanguage);
  return (
    <SafeAreaView className="flex-1 bg-purple-500">
      <Pressable
        onPress={toggleLanguage}
        className="p-4 bg-yellow-500 w-40 rounded-2xl ml-auto mr-4 mt-4"
      >
        <Text>Langugage: {language}</Text>
      </Pressable>
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
