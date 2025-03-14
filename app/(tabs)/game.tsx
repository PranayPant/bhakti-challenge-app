import {
  Image,
  StyleSheet,
  SafeAreaView,
  View,
  Pressable,
  Text,
} from "react-native";
import { useEffect, useState } from "react";

import { Audio } from "expo-av";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { FlipCard } from "@/components/FlipCard";
import { useSharedValue } from "react-native-reanimated";

const Question = () => {
    return <Text>Question</Text>;
};

const Answer = () => {
    return <Text>Answer</Text>;
};

export default function GameScreen() {
  const isFlipped = useSharedValue(false);

  const handlePress = () => {
    isFlipped.value = !isFlipped.value;
    playSound();
  };

  const [sound, setSound] = useState<Audio.Sound | null>(null);

  async function playSound() {
    const { sound } = await Audio.Sound.createAsync(
      require("@/assets/sounds/card-flip.mp3")
    );
    setSound(sound);
    await sound.playAsync();
  }

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <SafeAreaView style={styles.container}>
          <FlipCard
            isFlipped={isFlipped}
            cardStyle={styles.flipCard}
            FlippedContent={<Question />}
            RegularContent={<Answer />}
          />
          <View style={styles.buttonContainer}>
            <Pressable style={styles.toggleButton} onPress={handlePress}>
              <Text style={styles.toggleButtonText}>Toggle card</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  container: {
    flex: 1,
    height: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    marginTop: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleButton: {
    backgroundColor: "#b58df1",
    padding: 12,
    borderRadius: 48,
  },
  toggleButtonText: {
    color: "#fff",
    textAlign: "center",
  },
  flipCard: {
    width: 170,
    height: 200,
    backfaceVisibility: "hidden",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
  },
});
