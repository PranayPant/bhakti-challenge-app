import { Pressable, Text, View } from "react-native";
import { CardStack } from "@/components/CardStack";
import { useChallengeStore } from "@/stores/challenges";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Deck() {
  const challenges = useChallengeStore((store) => store.selectedChallengesData);
  const language = useChallengeStore((store) => store.language);
  const toggleLanguage = useChallengeStore((store) => store.toggleLanguage);
  const sort = useChallengeStore((store) => store.toggleSortChallenges);
  const sortOrder = useChallengeStore((store) => store.sortOrder);
  return (
    <SafeAreaView className="flex-1 bg-purple-500">
      <View className="flex flex-row gap-2 m-4 ml-auto">
        <Pressable
          onPress={sort}
          className="p-4 bg-yellow-500 w-fit rounded-2xl"
        >
          <Text>Sort ({sortOrder})</Text>
        </Pressable>
        <Pressable
          onPress={toggleLanguage}
          className="p-4 bg-yellow-500 w-fit rounded-2xl"
        >
          <Text>Langugage: {language}</Text>
        </Pressable>
      </View>

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
