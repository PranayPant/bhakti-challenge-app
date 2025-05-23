import { Pressable, Text, TextInput, View } from "react-native";
import { CardStack } from "@/components/CardStack";
import { useChallengeStore } from "@/stores/challenges";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

export default function Deck() {
  const challenges = useChallengeStore((store) => store.selectedChallengesData);
  const language = useChallengeStore((store) => store.language);
  const toggleLanguage = useChallengeStore((store) => store.toggleLanguage);
  const sort = useChallengeStore((store) => store.toggleSortChallenges);
  const sortOrder = useChallengeStore((store) => store.sortOrder);
  const [filterText, setFilterText] = useState("");
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
          <Text> {language}</Text>
        </Pressable>
      </View>
      <View className="flex flex-row items-center gap-2 w-4/5 m-4 ml-auto bg-white p-1 rounded-xl">
        <TextInput
          className="bg-white px-4 rounded-2xl flex-1 border border-gray-300"
          placeholder="e.g 1-12,33"
          onChangeText={(text) => {
            setFilterText(text);
          }}
        />
        <Pressable className="p-4 bg-yellow-500 w-fit rounded-2xl">
          <Text>Filter</Text>
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
