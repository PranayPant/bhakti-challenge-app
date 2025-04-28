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
import { useState } from "react";
import { useRouter } from "expo-router";
import { useChallengeStore } from "@/stores/challenges";

export default function HomeScreen() {
  const challenges = useChallengeStore((store) => store.selectedChallenges);
  const toggle = useChallengeStore((store) => store.toggleSelectedChallenge);
  const initialize = useChallengeStore((store) => store.setSelectedChallenges);
  const clear = useChallengeStore((store) => store.clearSelectedChallenges);

  const router = useRouter();
  const handlePress = () => {
    router.push("/deck");
  };
  return (
    <SafeAreaView style={styles.root}>
      <View
        style={{
          position: "sticky",
          top: 0,
          margin: 10,
          display: "flex",
          flexDirection: "row",
          gap: 10,
        }}
      >
        <Pressable
          style={{
            backgroundColor: "purple",
            padding: 10,
            borderRadius: 5,
          }}
          onPress={handlePress}
        >
          <Text style={{ color: "white" }}>Go to Deck</Text>
        </Pressable>
        <Pressable
          style={{
            backgroundColor: "purple",
            padding: 10,
            borderRadius: 5,
          }}
          onPress={() => {
            initialize(Trivia.map((item) => `${item.id}`));
          }}
          onLongPress={() => {
            clear();
          }}
          delayLongPress={500}
        >
          <Text style={{ color: "white" }}>Toggle select all</Text>
        </Pressable>
      </View>

      <FlatList
        style={styles.list}
        numColumns={3}
        data={Trivia}
        renderItem={({ item }) => {
          return (
            <View
              style={[
                styles.card,
                challenges.includes(item.id.toString()) && styles.selected,
              ]}
            >
              <Text>{item.id}</Text>
              <Pressable
                style={styles.button}
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "lightgreen",
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    flexDirection: "column",
  },
  card: {
    width: 100,
    height: 100,
    margin: 10,
    borderRadius: 10,
    backgroundColor: "lightblue",
    justifyContent: "center",
    alignItems: "center",
  },
  selected: {
    shadowColor: "#3b82f6",
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  button: {
    backgroundColor: "lightcoral",
    color: "white",
    padding: 8,
    borderRadius: 4,
    marginTop: 10,
  },
});
