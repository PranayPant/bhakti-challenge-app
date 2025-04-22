import { ReactNode, useCallback, useEffect, useState } from "react";
import {
  View,
  SafeAreaView,
  StyleSheet,
  TextInput,
  Text,
  Button,
  Dimensions,
  TextStyle,
} from "react-native";
import Animated, {
  useSharedValue,
  useDerivedValue,
  useAnimatedStyle,
  useAnimatedProps,
  interpolate,
  useAnimatedReaction,
  withTiming,
  runOnJS,
  Easing,
  SharedValue,
  DerivedValue,
} from "react-native-reanimated";
import {
  GestureDetector,
  GestureHandlerRootView,
  Gesture,
  Pressable,
} from "react-native-gesture-handler";

import { Card, Colors } from "./Card";

const { height, width } = Dimensions.get("window");

const DECK_SIZE = 3;

const randomSentences = ["0", "1", "2", "3", "4"];

interface CardContainerProps {
  index: number;
  color: string;
  frontDisplay: DerivedValue<string>;
  priority: DerivedValue<number>;
  updatePriorities: VoidFunction;
}

const CardContainer = ({
  index,
  color,
  updatePriorities,
  frontDisplay,
  priority,
}: CardContainerProps) => {
  const BOTTOM_BUFFER = 30;
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const rotation = useSharedValue(BOTTOM_BUFFER);
  const isRightFlick = useSharedValue(true);
  const rotationValue = useDerivedValue(
    () =>
      `${interpolate(
        rotation.value,
        isRightFlick.value
          ? [BOTTOM_BUFFER * priority.value, height]
          : [BOTTOM_BUFFER * priority.value, -height],
        [0, 4]
      )}rad`
  );

  const panGesture = Gesture.Pan()
    .onBegin(({ absoluteX, translationY, translationX }) => {
      if (priority.value > 0) {
        return;
      }
      //translateY.value = translationY;
      rotation.value = translationX + BOTTOM_BUFFER;
      translateX.value = translationX;

      if (absoluteX < (width * 0.8) / 2) {
        isRightFlick.value = false;
      }
    })
    .onUpdate(({ translationY, translationX }) => {
      if (priority.value > 0) {
        return;
      }
      //translateY.value = translationY;
      rotation.value = translationX + BOTTOM_BUFFER;
      translateX.value = translationX;
    })
    .onEnd(({ translationY, translationX }) => {
      if (priority.value > 0) {
        return;
      }
      if (Math.abs(Math.round(translationX)) < 50) {
        translateX.value = withTiming(
          0,
          {
            duration: 200,
            easing: Easing.quad,
          },
          () => {
            isRightFlick.value = true;
          }
        );
        rotation.value = withTiming(BOTTOM_BUFFER, {
          duration: 200,
          easing: Easing.quad,
        });
        return;
      }

      runOnJS(updatePriorities)();

      translateX.value = withTiming(
        0,
        {
          duration: 400,
          easing: Easing.quad,
        },
        () => {
          isRightFlick.value = true;
        }
      );

      rotation.value = withTiming(
        0,
        {
          duration: 400,
          easing: Easing.linear,
        },
        () => {
          rotation.value = BOTTOM_BUFFER;
        }
      );
    });

  console.log("CardContainer", index, 10 - priority.value);

  const animatedStyle = useAnimatedStyle(() => ({
    position: "absolute",
    height: 400,
    width: 300,
    backgroundColor: color,
    bottom: withTiming(BOTTOM_BUFFER + 10 * priority.value),
    borderRadius: 8,
    zIndex: 10 - priority.value,
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value + priority.value * -10 },
      {
        rotate: rotationValue.value,
      },
    ],
  }));

  return (
    <>
      <GestureDetector gesture={panGesture}>
        <Card
          id={index}
          frontDisplay={frontDisplay}
          style={animatedStyle}
        ></Card>
      </GestureDetector>
    </>
  );
};

export const CardStack = () => {
  const indices = Array.from({ length: DECK_SIZE }, (_, i) => i);
  const priorities = useSharedValue(indices);
  const firstCard = useSharedValue(0);
  const secondCard = useSharedValue(1);
  const thirdCard = useSharedValue(2);

  const firstPriority = useDerivedValue(() => {
    return priorities.value.findIndex((item) => item === 0);
  });

  const secondPriority = useDerivedValue(() => {
    return priorities.value.findIndex((item) => item === 1);
  });

  const thirdPriority = useDerivedValue(() => {
    return priorities.value.findIndex((item) => item === 2);
  });

  const firstCardText = useDerivedValue(() => {
    return `${firstCard.value}`;
  });

  const secondCardText = useDerivedValue(() => {
    return `${secondCard.value}`;
  });

  const thirdCardText = useDerivedValue(() => {
    return `${thirdCard.value}`;
  });

  const updatePriorities = useCallback(() => {
    const newPriorities = [...priorities.value.slice(1), priorities.value[0]];
    priorities.value = newPriorities;
  }, []);

  useAnimatedReaction(
    () => priorities.value,
    (updatedPriorities) => {
      console.log("Priorities changed", updatedPriorities);
      if (updatedPriorities[0] === 0) {
        console.log("Incrementing last card at the start of every iteration");
        thirdCard.value = firstCard.value + DECK_SIZE - 1;
      } else if (updatedPriorities[0] === DECK_SIZE - 1) {
        console.log("Incrementing first two cards by DECK_SIZE");
        firstCard.value = firstCard.value + DECK_SIZE;
        secondCard.value = secondCard.value + DECK_SIZE;
      }
    }
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <CardContainer
          index={2}
          updatePriorities={updatePriorities}
          frontDisplay={thirdCardText}
          priority={thirdPriority}
          color={Colors.LIGHT_BLUE}
        />
        <CardContainer
          index={1}
          updatePriorities={updatePriorities}
          frontDisplay={secondCardText}
          priority={secondPriority}
          color={Colors.LIGHT_GOLD}
        />
        <CardContainer
          index={0}
          updatePriorities={updatePriorities}
          frontDisplay={firstCardText}
          priority={firstPriority}
          color={Colors.LIGHT_RED}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
    padding: 8,
  },
});
