import { Pressable, Text, TextInput, View } from "react-native";

import { CardStack } from "@/components/CardStack";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useState } from "react";
import { Select } from "./ui/Select";
import { useChallengeStore } from "@/stores/challenge-provider";

export function Deck() {
  const challenges = useChallengeStore((store) => store.selectedChallenges);
  const language = useChallengeStore((store) => store.language);
  const setLanguage = useChallengeStore((store) => store.setLanguage);
  const sort = useChallengeStore((store) => store.toggleSort);
  const sortOrder = useChallengeStore((store) => store.sortOrder);
  const [filterText, setFilterText] = useState("");
  const setFilter = useChallengeStore((store) => store.setFilterString);
  const randomized = useChallengeStore((store) => store.randomized);
  const setRandomized = useChallengeStore((store) => store.setRandomized);
  const goBackwards = useChallengeStore((store) => store.goBackwards);

  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      className="flex-1 bg-purple-500 px-4"
    >
      <View className="flex flex-row gap-2 ml-auto mt-4">
        <TextInput
          className="h-10 flex-1 px-4 py-2 rounded-2xl border border-gray-300 bg-white text-black"
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

      <View className="flex flex-row gap-2 items-center m-4 mx-auto">
        <Pressable
          className="bg-yellow-500 p-2 rounded-full w-fit"
          onPress={goBackwards}
        >
          <Text>Back</Text>
        </Pressable>
        <Pressable
          className="bg-yellow-500 p-2 rounded-full w-fit"
          onPress={() => {
            setRandomized(!randomized);
          }}
        >
          <Text>Random ({randomized ? "On" : "Off"})</Text>
        </Pressable>
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
    </View>
  );
}
