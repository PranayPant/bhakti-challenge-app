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
  return <Text>{trivia.question}</Text>;
};

const Answer = ({ trivia }: { trivia: TriviaCard }) => {
  return <Text>{trivia.correctAnswer}</Text>;
};

const DECK_SIZE_DISPLAY = 3;

export default function GameScreen() {
  const isFlipped = useSharedValue(false);

  const [currentIndex, setCurrentIndex] = useState(() => 0);
  const [flipSound, setFlipSound] = useState<Audio.Sound | null>(null);
  const [nextSound, setNextSound] = useState<Audio.Sound | null>(null);
  const [flippedState, setFlippedState] = useState(false);
  const [triviaDeck, setTriviaDeck] = useState<TriviaCard[]>(() => Trivia);

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
    setTriviaDeck((prev) => {
      const nextIndex = (currentIndex + DECK_SIZE_DISPLAY) % Trivia.length;
      const nextCard = Trivia[nextIndex];
      const currentCard = Trivia[currentIndex];
      return [currentCard, ...prev.slice(1), nextCard];
    });
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
          {triviaDeck.map((card, index) => {
            if (
              index > currentIndex + DECK_SIZE_DISPLAY ||
              index < currentIndex
            ) {
              return null;
            }
            return (
              <FlipCard
                key={card.id}
                isFlipped={isFlipped}
                FlippedContent={<Answer trivia={card} />}
                RegularContent={<Question trivia={card} />}
                index={currentIndex}
                currentIndex={currentIndex}
                handleNext={handleNext}
                cardStyles={{
                  zIndex: triviaDeck.length - index,
                  boxShadow: "0 0 16px rgba(0, 0, 0, 0.1)",
                }}
              />
            );
          })}
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
