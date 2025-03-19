import React, { ReactNode } from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
  type SharedValue,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Audio } from "expo-av";

export interface FlipCardProps {
  RegularContent: ReactNode;
  FlippedContent: ReactNode;
  index: number;
  currentIndex: number;
  handleNext?: VoidFunction;
  direction?: "x" | "y";
  duration?: number;
  maxVisibleItems?: number;
  cardStyles?: any;
}

export const FlipCard = ({
  direction = "y",
  duration = 500,
  maxVisibleItems = 3,
  RegularContent,
  FlippedContent,
  index,
  currentIndex,
  handleNext,
  cardStyles,
}: FlipCardProps) => {
  const isFlipDirectionX = direction === "x";
  const isFlipped = useSharedValue(false);

  const regularCardAnimatedStyle = useAnimatedStyle(() => {
    const spinValue = interpolate(Number(isFlipped.value), [0, 1], [0, 180]);
    const rotateValue = withTiming(`${spinValue}deg`, { duration });

    return {
      transform: [
        isFlipDirectionX ? { rotateX: rotateValue } : { rotateY: rotateValue },
      ],
    };
  });

  const flippedCardAnimatedStyle = useAnimatedStyle(() => {
    const spinValue = interpolate(Number(isFlipped.value), [0, 1], [180, 360]);
    const rotateValue = withTiming(`${spinValue}deg`, { duration });

    return {
      transform: [
        isFlipDirectionX ? { rotateX: rotateValue } : { rotateY: rotateValue },
      ],
    };
  });

  async function playFlipSound() {
    const { sound } = await Audio.Sound.createAsync(
      require("@/assets/sounds/swipe.mp3")
    );
    await sound.setStatusAsync({ shouldPlay: true, rate: 1.5 });
  }

  useAnimatedReaction(
    () => isFlipped.value,
    (value: boolean) => {
      runOnJS(playFlipSound)();
    },
    [isFlipped]
  );

  const tapGesture = Gesture.Tap()
    .onBegin((event) => {
      //pressed.value = true;
      console.log("Start Tap", currentIndex, index);
    })
    .onEnd((event) => {
      isFlipped.value = !isFlipped.value;
      console.log("End Tap", currentIndex, index);
    });

  return (
    <GestureDetector gesture={tapGesture}>
      <View style={[styles.container, cardStyles]}>
        <Animated.View
          style={[
            index === currentIndex ? styles.flipCard : {},
            index === currentIndex ? styles.regularCard : {},
            regularCardAnimatedStyle,
          ]}
        >
          {RegularContent}
        </Animated.View>
        <Animated.View
          style={[
            index === currentIndex ? styles.flipCard : {},
            index === currentIndex ? styles.flippedCard : {},
            flippedCardAnimatedStyle,
          ]}
        >
          {FlippedContent}
        </Animated.View>
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flipCard: {
    backfaceVisibility: "hidden",
    width: "100%",
    height: "100%",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  regularCard: {
    position: "absolute",
    zIndex: 1,
  },
  flippedCard: {
    zIndex: 2,
  },
});
