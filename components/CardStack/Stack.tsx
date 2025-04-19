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
  const rotation = useSharedValue(BOTTOM_BUFFER);
  const isRightFlick = useSharedValue(true);
  const rotationValue = useDerivedValue(
    () =>
      `${interpolate(
        rotation.value,
        isRightFlick.value ? [BOTTOM_BUFFER, height] : [BOTTOM_BUFFER, -height],
        [0, 4]
      )}rad`
  );

  const panGesture = Gesture.Pan()
    .onBegin(({ absoluteX, translationY }) => {
      if (priority.value > 0) {
        return;
      }
      translateY.value = translationY;
      rotation.value = translationY + BOTTOM_BUFFER;
      if (absoluteX < width / 2) {
        isRightFlick.value = false;
      }
    })
    .onUpdate(({ translationY }) => {
      if (priority.value > 0) {
        return;
      }
      translateY.value = translationY;
      rotation.value = translationY + BOTTOM_BUFFER;
    })
    .onEnd(({ translationY }) => {
      if (priority.value > 0) {
        return;
      }
      if (Math.abs(Math.round(translationY)) < 100) {
        translateY.value = withTiming(
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

      translateY.value = withTiming(
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
        -1280,
        {
          duration: 400,
          easing: Easing.linear,
        },
        () => {
          rotation.value = BOTTOM_BUFFER;
        }
      );
    });

  const animatedStyle = useAnimatedStyle(() => ({
    position: "absolute",
    height: 200,
    width: 325,
    backgroundColor: color,
    bottom: withTiming(BOTTOM_BUFFER + 20 * priority.value),
    borderRadius: 8,
    zIndex: interpolate(priority.value, [0, 2], [20, 10]),
    transform: [
      { translateY: translateY.value },
      {
        rotate: rotationValue.value,
      },
      {
        scale: withTiming(interpolate(priority.value, [0, 2], [1, 0.9]), {
          duration: 400,
          easing: Easing.quad,
        }),
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
          index={0}
          updatePriorities={updatePriorities}
          frontDisplay={firstCardText}
          priority={firstPriority}
          color={Colors.LIGHT_RED}
        />
        <CardContainer
          index={1}
          updatePriorities={updatePriorities}
          frontDisplay={secondCardText}
          priority={secondPriority}
          color={Colors.LIGHT_GOLD}
        />
        <CardContainer
          index={2}
          updatePriorities={updatePriorities}
          frontDisplay={thirdCardText}
          priority={thirdPriority}
          color={Colors.LIGHT_BLUE}
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
