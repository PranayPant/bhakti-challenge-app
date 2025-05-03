import {
  SafeAreaView,
  View,
  StyleSheet,
  Text,
  Button,
  FlatList,
  Pressable,
} from "react-native";

import { Trivia } from "@/constants/Trivia";
import { useRouter } from "expo-router";
import { useChallengeStore } from "@/stores/challenges";

export default function HomeScreen() {
  const challenges = useChallengeStore((store) => store.selectedChallenges);
  const toggle = useChallengeStore((store) => store.toggleSelectedChallenge);
  const toggleAll = useChallengeStore((store) => store.toggleAllChallenges);

  const router = useRouter();
  const handlePress = () => {
    router.push("/deck");
  };
  return (
    <SafeAreaView className="flex-1 bg-gray-100 p-4 ">
      <View className="p-4 flex-row justify-between items-center mb-4">
        <Pressable
          className="bg-purple-500 p-2 rounded-md"
          onPress={handlePress}
        >
          <Text className="text-white">Go to Deck</Text>
        </Pressable>
        <Pressable
          className="bg-purple-500 p-2 rounded-md"
          onPress={() => {
            toggleAll(Trivia.map((item) => item.id.toString()));
          }}
          delayLongPress={500}
        >
          <Text className="text-white">Toggle select all</Text>
        </Pressable>
      </View>

      <FlatList
        className="flex-col"
        numColumns={3}
        data={Trivia}
        contentContainerClassName="items-center"
        renderItem={({ item }) => {
          return (
            <View
              className={`w-24 h-24 m-2 rounded-lg bg-blue-200 justify-center items-center ${
                challenges.includes(item.id.toString())
                  ? "border-2 border-blue-500"
                  : ""
              }`}
            >
              <Text>{item.id}</Text>
              <Pressable
                className="bg-red-300 text-white p-2 rounded mt-2"
                onPress={() => {
                  toggle(item.id.toString());
                }}
              >
                <Text
                  style={{
                    color: challenges.includes(item.id.toString())
                      ? "white"
                      : "black",
                  }}
                >
                  {challenges.includes(item.id.toString())
                    ? "Selected"
                    : "Select"}
                </Text>
              </Pressable>
            </View>
          );
        }}
        keyExtractor={(item) => `${item.id}`}
      />
    </SafeAreaView>
  );
}
