import React from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
  type SharedValue,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ReactNode } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

export interface FlipCardProps {
  isFlipped: SharedValue<boolean>;
  RegularContent: ReactNode;
  FlippedContent: ReactNode;
  index: number;
  currentIndex: number;
  handleNext: VoidFunction;
  direction?: "x" | "y";
  duration?: number;
  maxVisibleItems?: number;
  cardStyles?: any;
}

export const FlipCard = ({
  isFlipped,
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

  const animatedValue = useSharedValue(0);
  const translateX = useSharedValue(0);
  const swipeDirection = useSharedValue(0);
  const { width } = useWindowDimensions();

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

  const tapGesture = Gesture.Tap()
    .onBegin((event) => {
      //pressed.value = true;
      console.log("Start Tap", event);
    })
    .onEnd((event) => {
      isFlipped.value = !isFlipped.value;
      console.log("End Tap", event);
    });

  const panGesture = Gesture.Pan()
    .onBegin((event) => {
      console.log("Start Pan", event);
    })
    .onEnd((event) => {
      if (currentIndex === index) {
        // If the swipe distance is greater than 150 or the swipe velocity is greater than 1000
        // go to the next card
        if (
          Math.abs(event.translationX) > 150 ||
          Math.abs(event.velocityX) > 1000
        ) {
          translateX.value = withTiming(
            width * swipeDirection.value,
            {},
            () => {
              runOnJS(handleNext)();
            }
          );
          animatedValue.value = withTiming(currentIndex + 1);
          // If the swipe distance is less than 150 or the swipe velocity is less than 1000
          // go back to the original position
        } else {
          translateX.value = withTiming(0, { duration: 500 });
          animatedValue.value = withTiming(currentIndex, {
            duration: 500,
          });
        }
      }
    })
    .onUpdate((event) => {
      // e.translationX is the distance of the swipe
      // e.translationX is positive if the swipe is to the right
      // isSwipeRight is true if the swipe is to the right
      const isSwipeRight = event.translationX > 0;

      // direction 1 is right, -1 is left
      swipeDirection.value = isSwipeRight ? 1 : -1;

      // If the current index is the same as the index of the card
      if (currentIndex === index) {
        translateX.value = event.translationX;
        animatedValue.value = interpolate(
          Math.abs(event.translationX),
          [0, width],
          [index, index + 1]
        );
      }
    });

  const animatedSwipeStyle = useAnimatedStyle(() => {
    const currentItem = index === currentIndex;

    const translateY = interpolate(
      animatedValue.value,
      [index - 1, index],
      [-30, 0]
    );

    const scale = interpolate(
      animatedValue.value,
      [index - 1, index],
      [0.9, 1]
    );

    const rotateZ = interpolate(
      Math.abs(translateX.value),
      [0, width],
      [0, 20]
    );

    const opacity = interpolate(
      animatedValue.value + maxVisibleItems,
      [index, index + 1],
      [0, 1]
    );

    return {
      transform: [
        { translateY: currentItem ? 0 : translateY },
        { scale: currentItem ? 1 : scale },
        { translateX: translateX.value },
        {
          rotateZ: currentItem
            ? `${swipeDirection.value * rotateZ}deg`
            : "0deg",
        },
      ],
      opacity: index < currentIndex + maxVisibleItems ? 1 : opacity,
    };
  });

  const gestures = Gesture.Exclusive(panGesture, tapGesture);

  return (
    <GestureDetector gesture={gestures}>
      <View style={[flipCardStyles.container, cardStyles]}>
        <Animated.View
          style={[
            index === currentIndex ? flipCardStyles.flipCard : {},
            index === currentIndex ? flipCardStyles.regularCard : {},
            regularCardAnimatedStyle,
            animatedSwipeStyle,
          ]}
        >
          {RegularContent}
        </Animated.View>
        <Animated.View
          style={[
            index === currentIndex ? flipCardStyles.flipCard : {},
            index === currentIndex ? flipCardStyles.flippedCard : {},
            flippedCardAnimatedStyle,
            animatedSwipeStyle,
          ]}
        >
          {FlippedContent}
        </Animated.View>
      </View>
    </GestureDetector>
  );
};

const flipCardStyles = StyleSheet.create({
  container: {
    flex: 1,
    position: "absolute",
    top: "50%",
    left: "0%",
    transform: [{ translateX: -150 }, { translateY: -150 }],
    borderRadius: 28,
    // backgroundColor: "lightblue",
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
  regularCard: {
    position: "absolute",
    zIndex: 1,
  },
  flippedCard: {
    zIndex: 2,
  },
});
