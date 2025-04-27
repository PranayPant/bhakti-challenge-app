import { useCallback } from "react";
import { SafeAreaView, StyleSheet, Dimensions, View, Text } from "react-native";
import {
  useSharedValue,
  useDerivedValue,
  useAnimatedStyle,
  interpolate,
  useAnimatedReaction,
  withTiming,
  runOnJS,
  Easing,
  DerivedValue,
} from "react-native-reanimated";
import {
  GestureDetector,
  GestureHandlerRootView,
  Gesture,
} from "react-native-gesture-handler";

import { Card } from "./Card";
import { Trivia } from "@/constants/Trivia";
import { Colors } from "@/constants/Colors";
import { useChallengeStore } from "@/stores/challenges";

const { height, width } = Dimensions.get("window");

const DECK_SIZE = 3;

interface CardContainerProps {
  index: number;
  color: string;
  frontDisplay: DerivedValue<string>;
  backDisplay: DerivedValue<string>;
  priority: DerivedValue<number>;
  updatePriorities: VoidFunction;
}

const CardContainer = ({
  index,
  color,
  updatePriorities,
  frontDisplay,
  backDisplay,
  priority,
}: CardContainerProps) => {
  const BOTTOM_BUFFER = 30;
  const isFlipped = useSharedValue(false);
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
    .onBegin(({ absoluteX, translationX, translationY }) => {
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
      rotation.value = translationX + BOTTOM_BUFFER;
      translateX.value = translationX;

      if (absoluteX < (width * 0.8) / 2) {
        isRightFlick.value = false;
      }
    })
    .onUpdate(({ translationX }) => {
      if (priority.value > 0) {
        return;
      }
      rotation.value = translationX + BOTTOM_BUFFER;
      translateX.value = translationX;
    })
    .onEnd(({ translationX }) => {
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

      isFlipped.value = false;

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

  const animatedRootStyle = useAnimatedStyle(() => ({
    position: "absolute",
    height: 400,
    width: 300,
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

  const animatedFrontStyle = useAnimatedStyle(() => ({
    backgroundColor: color,
    borderRadius: 8,
    zIndex: isFlipped.value ? 0 : 10,
  }));

  const animatedBackStyle = useAnimatedStyle(() => ({
    backgroundColor: "lightgreen",
    borderRadius: 8,
    zIndex: isFlipped.value ? 10 : 0,
  }));

  return (
    <>
      <GestureDetector gesture={panGesture}>
        <Card
          id={index}
          isFlipped={isFlipped}
          frontDisplay={frontDisplay}
          backDisplay={backDisplay}
          rootStyle={animatedRootStyle}
          frontStyle={animatedFrontStyle}
          backStyle={animatedBackStyle}
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

  const selectedChallenges = useChallengeStore(
    (state) => state.selectedChallenges
  );
  const filteredTrivia = Trivia.filter((item) =>
    selectedChallenges.includes(item.id.toString())
  );

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
    return `${
      filteredTrivia[firstCard.value % filteredTrivia.length].question
    }`;
  });

  const secondCardText = useDerivedValue(() => {
    return `${
      filteredTrivia[secondCard.value % filteredTrivia.length].question
    }`;
  });

  const thirdCardText = useDerivedValue(() => {
    return `${
      filteredTrivia[thirdCard.value % filteredTrivia.length].question
    }`;
  });

  const firstCardAnswer = useDerivedValue(() => {
    return `${
      filteredTrivia[firstCard.value % filteredTrivia.length].correctAnswer
    }`;
  });

  const secondCardAnswer = useDerivedValue(() => {
    return `${
      filteredTrivia[secondCard.value % filteredTrivia.length].correctAnswer
    }`;
  });

  const thirdCardAnswer = useDerivedValue(() => {
    return `${
      filteredTrivia[thirdCard.value % filteredTrivia.length].correctAnswer
    }`;
  });

  const updatePriorities = useCallback(() => {
    const newPriorities = [...priorities.value.slice(1), priorities.value[0]];
    priorities.value = newPriorities;
  }, []);

  useAnimatedReaction(
    () => priorities.value,
    (updatedPriorities) => {
      if (updatedPriorities[0] === 0) {
        thirdCard.value = firstCard.value + DECK_SIZE - 1;
      } else if (updatedPriorities[0] === DECK_SIZE - 1) {
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
          backDisplay={thirdCardAnswer}
          priority={thirdPriority}
          color={Colors.blue[400]}
        />
        <CardContainer
          index={1}
          updatePriorities={updatePriorities}
          frontDisplay={secondCardText}
          backDisplay={secondCardAnswer}
          priority={secondPriority}
          color={Colors.yellow[400]}
        />
        <CardContainer
          index={0}
          updatePriorities={updatePriorities}
          frontDisplay={firstCardText}
          backDisplay={firstCardAnswer}
          priority={firstPriority}
          color={Colors.red[400]}
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
