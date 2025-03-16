import {
  Image,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Text,
  Dimensions,
} from "react-native";
import { useEffect, useState } from "react";

import Animated, {
  useAnimatedReaction,
  useSharedValue,
  runOnJS,
  RollInLeft,
  RollOutLeft,
  RollInRight,
} from "react-native-reanimated";
import { Audio } from "expo-av";

import { FlipCard } from "@/components/FlipCard";
import { Trivia } from "@/constants/Trivia";

const Question = ({ trivia }: { trivia: number }) => {
  return <Text>{Trivia[trivia].question}</Text>;
};

const Answer = ({ trivia }: { trivia: number }) => {
  return <Text>{Trivia[trivia].correctAnswer}</Text>;
};

export default function GameScreen() {
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const isFlipped = useSharedValue(false);

  const [flippedState, setFlippedState] = useState(false);

  useAnimatedReaction(
    () => isFlipped.value,
    (value: boolean) => {
      runOnJS(setFlippedState)(value);
    },
    [isFlipped]
  );

  const handlePress = () => {
    isFlipped.value = !isFlipped.value;
    playFlipSound();
  };

  const handleNext = () => {
    setCurrentQuestion((prev) => (prev + 1) % Trivia.length);
    isFlipped.value = false;
    playSwipeSound();
  };
  const [flipSound, setFlipSound] = useState<Audio.Sound | null>(null);
  const [nextSound, setNextSound] = useState<Audio.Sound | null>(null);

  async function playFlipSound() {
    const { sound } = await Audio.Sound.createAsync(
      require("@/assets/sounds/card-flip.mp3")
    );
    setFlipSound(sound);
    await sound.setStatusAsync({ shouldPlay: true, rate: 1.5 });
  }

  async function playSwipeSound() {
    const { sound } = await Audio.Sound.createAsync(
      require("@/assets/sounds/swipe.mp3")
    );
    setNextSound(sound);
    await sound.setStatusAsync({ shouldPlay: true, rate: 0.65 });
  }

  useEffect(() => {
    return () => {
      flipSound?.unloadAsync();
      nextSound?.unloadAsync();
    };
  }, [flipSound, nextSound]);

  useEffect(() => {
    return () => {
      flipSound?.unloadAsync();
      nextSound?.unloadAsync();
    };
  }, [flipSound, nextSound]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={[styles.reactLogo]}
        />
      </SafeAreaView>
      <SafeAreaView
        style={{
          flex: 4,
          backgroundColor: "lightgreen",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Animated.View
          key={currentQuestion}
          entering={RollInRight}
          exiting={RollOutLeft}
        >
          <FlipCard
            isFlipped={isFlipped}
            cardStyle={styles.flipCard}
            FlippedContent={<Answer trivia={currentQuestion} />}
            RegularContent={<Question trivia={currentQuestion} />}
          />
        </Animated.View>
      </SafeAreaView>
      <SafeAreaView
        style={{
          flex: 1,
          flexDirection: "row",
          backgroundColor: "lightpink",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Pressable style={styles.toggleButton} onPress={handlePress}>
          <Text style={styles.toggleButtonText}>
            {flippedState ? "Back to Question" : "Check Answer"}
          </Text>
        </Pressable>
        <Pressable style={styles.toggleButton} onPress={handleNext}>
          <Text style={styles.toggleButtonText}>Next</Text>
        </Pressable>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reactLogo: {
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  container: {
    flex: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "lightgreen",
  },
  buttonContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "skyblue",
  },
  toggleButton: {
    backgroundColor: "#b58df1",
    padding: 12,
    borderRadius: 48,
    maxWidth: 150,
    minWidth: 100,
    margin: 16,
  },
  toggleButtonText: {
    color: "#fff",
    textAlign: "center",
  },
  flipCard: {
    backfaceVisibility: "hidden",
    width: 300,
    height: 300,
    backgroundColor: "white",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
