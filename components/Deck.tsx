import { Pressable, Text, TextInput, View } from "react-native";

import { CardStack } from "@/components/CardStack";
import { useChallengeStore } from "@/stores/challenges";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { Select } from "./ui/Select";

export function Deck() {
  const challenges = useChallengeStore((store) => store.selectedChallenges);
  const language = useChallengeStore((store) => store.language);
  const setLanguage = useChallengeStore((store) => store.setLanguage);
  const sort = useChallengeStore((store) => store.toggleSort);
  const sortOrder = useChallengeStore((store) => store.sortOrder);
  const [filterText, setFilterText] = useState("");
  const setFilter = useChallengeStore((store) => store.setFilterString);
  const mode = useChallengeStore((store) => store.mode);
  const setMode = useChallengeStore((store) => store.setMode);
  const randomized = useChallengeStore((store) => store.randomized);
  const setRandomized = useChallengeStore((store) => store.setRandomized);
  const goBackwards = useChallengeStore((store) => store.goBackwards);
  return (
    <SafeAreaView className="flex-1 bg-purple-500 p-2">
      <View className="flex flex-row gap-2 m-4 mx-auto">
        <View className="flex flex-1 flex-row gap-2 ml-auto">
          <TextInput
            className="flex-1 px-4 rounded-2xl border border-gray-300 bg-white text-black"
            placeholder="e.g 1-12,33,40+"
            placeholderTextColor="#9CA3AF"
            onChangeText={(text) => {
              setFilterText(text);
            }}
          />
          <Pressable
            onPress={() => setFilter(filterText)}
            className="p-2 bg-yellow-500 w-fit self-center rounded-2xl"
          >
            <Text>Filter</Text>
          </Pressable>
        </View>
        <Pressable
          onPress={sort}
          className="p-2 bg-yellow-500 w-fit rounded-2xl"
        >
          <Text>Sort ({sortOrder})</Text>
        </Pressable>
        <Select
          onSelect={(value) => setLanguage(value as "hi" | "hi_trans")}
          options={[
            { label: "Hindi", value: "hi" },
            { label: "Hindi (Transliterated)", value: "hi_trans" },
          ]}
          btnText={`Lang (${language})`}
          btnClass="p-2 bg-yellow-500 rounded-2xl"
        />
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
      <View className="border-2 border-dashed border-white p-2 flex flex-row items-center gap-2">
        <Pressable
          className="bg-yellow-500 p-2 rounded-full w-fit"
          onPress={() => {
            if (mode === "quiz") {
              setMode("default");
            } else {
              setMode("quiz");
            }
          }}
        >
          <Text>Mode ({mode})</Text>
        </Pressable>
        <Pressable
          className="bg-yellow-500 p-2 rounded-full w-fit"
          onPress={() => {
            setRandomized(!randomized);
          }}
        >
          <Text>Randomize ({randomized ? "On" : "Off"})</Text>
        </Pressable>
        <Pressable
          className="bg-yellow-500 p-2 rounded-full w-fit"
          onPress={goBackwards}
        >
          <Text>Go back one</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
