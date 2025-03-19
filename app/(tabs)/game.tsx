import {
  Image,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Text,
  View,
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
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";

import { Audio } from "expo-av";

import { FlipCard } from "@/components/FlipCard";
import { Trivia, type TriviaCard } from "@/constants/Trivia";

const Question = ({ trivia }: { trivia: TriviaCard }) => {
  return (
    <View style={{ flex: 1, backgroundColor: "lightblue", width: "100%" }}>
      <Image
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 28,
          resizeMode: 'cover',
        }}
        source={require("@/assets/images/image_01.png")}
      />
      <Text>{trivia.question}</Text>
    </View>
  );
};

const Answer = ({ trivia }: { trivia: TriviaCard }) => {
  return <Text>{trivia.correctAnswer}</Text>;
};

export default function GameScreen() {
  const isFlipped = useSharedValue(false);

  const [currentIndex, setCurrentIndex] = useState(() => 0);
  const [flipSound, setFlipSound] = useState<Audio.Sound | null>(null);
  const [nextSound, setNextSound] = useState<Audio.Sound | null>(null);
  const [flippedState, setFlippedState] = useState(false);

  useAnimatedReaction(
    () => isFlipped.value,
    (value: boolean) => {
      runOnJS(setFlippedState)(value);
      runOnJS(playFlipSound)();
    },
    [isFlipped]
  );

  const handleFlip = () => {
    isFlipped.value = !isFlipped.value;
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % Trivia.length);
    isFlipped.value = false;
    playSwipeSound();
  };

  async function playFlipSound() {
    const { sound } = await Audio.Sound.createAsync(
      require("@/assets/sounds/swipe.mp3")
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
        <View>
          <FlipCard
            FlippedContent={<Answer trivia={Trivia[currentIndex]} />}
            RegularContent={<Question trivia={Trivia[currentIndex]} />}
            index={currentIndex}
            currentIndex={currentIndex}
            handleNext={handleNext}
            cardStyles={{
              boxShadow: "0 0 16px rgba(0, 0, 0, 0.1)",
              position: "absolute",
              top: "50%",
              left: "0%",
              transform: [{ translateX: -150 }, { translateY: -150 }],
              borderRadius: 28,
            }}
          />
        </View>
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
        <Pressable style={styles.toggleButton} onPress={handleFlip}>
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
  flipCardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
