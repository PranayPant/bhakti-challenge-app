import React, { ReactNode, use, useCallback, useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, Dimensions, Text } from "react-native";
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
import { Colors } from "@/constants/Colors";
import { FlashCard } from "./FlashCard";
import { useCardPriorities } from "@/hooks/useCardPriorities";
import { useChallengeStore } from "@/stores/challenge-provider";

const { height, width } = Dimensions.get("window");

const DECK_SIZE = 3;

interface CardContainerProps {
  index: number;
  color: string;
  frontDisplay: ReactNode;
  backDisplay: ReactNode;
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
  const rotationValue = useDerivedValue(
    () => `${interpolate(rotation.value, [BOTTOM_BUFFER, height], [0, 4])}rad`
  );
  const isShuffling = useSharedValue(false);

  const panGesture = Gesture.Pan()
    .onBegin(({ translationX }) => {
      isShuffling.value = false;
      if (priority.value > 0) {
        return;
      }
      if (Math.abs(Math.round(translationX)) < 50) {
        translateX.value = 0;
        rotation.value = BOTTOM_BUFFER;
        return;
      }
      rotation.value = translationX + BOTTOM_BUFFER;
      translateX.value = translationX;
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
      isShuffling.value = true;
      if (Math.abs(Math.round(translationX)) < 50) {
        translateX.value = 0;
        rotation.value = BOTTOM_BUFFER;
        return;
      }

      isFlipped.value = false;

      updatePriorities();

      translateX.value = 0;
      rotation.value = BOTTOM_BUFFER;
    });

  const animatedRootStyle = useAnimatedStyle(() => ({
    position: "absolute",
    height: 450,
    width: 350,
    bottom: withTiming(BOTTOM_BUFFER - 10 * priority.value),
    borderRadius: 8,
    zIndex: 1000 - priority.value * 100,
    elevation: 1000 - priority.value * 100,

    transform: [
      { translateY: translateY.value - 50 * priority.value },
      {
        translateX: isShuffling.value
          ? withTiming(translateX.value, {
              duration: 200,
              easing: Easing.linear,
            })
          : translateX.value,
      },
      {
        rotate: rotationValue.value,
      },
      {
        scale: withTiming(interpolate(priority.value, [0, 2], [1, 0.9]), {
          duration: 200,
          easing: Easing.quad,
        }),
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

export const CardStack = React.memo(() => {
  const { shuffle, priorityOne, priorityTwo, priorityThree } =
    useCardPriorities();

  const dataIndexOne = useChallengeStore((store) => store.dataIndexOne);
  const dataIndexTwo = useChallengeStore((store) => store.dataIndexTwo);
  const dataIndexThree = useChallengeStore((store) => store.dataIndexThree);
  const mode = useChallengeStore((store) => store.mode);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <CardContainer
          index={2}
          updatePriorities={shuffle}
          frontDisplay={
            <FlashCard mode={mode} dataIndex={dataIndexThree} index={2} />
          }
          backDisplay={<FlashCard dataIndex={dataIndexThree} index={2} />}
          priority={priorityThree}
          color={Colors.blue[400]}
        />
        <CardContainer
          index={1}
          updatePriorities={shuffle}
          frontDisplay={
            <FlashCard mode={mode} dataIndex={dataIndexTwo} index={1} />
          }
          backDisplay={<FlashCard dataIndex={dataIndexTwo} index={1} />}
          priority={priorityTwo}
          color={Colors.yellow[400]}
        />
        <CardContainer
          index={0}
          updatePriorities={shuffle}
          frontDisplay={
            <FlashCard mode={mode} dataIndex={dataIndexOne} index={0} />
          }
          backDisplay={<FlashCard dataIndex={dataIndexOne} index={0} />}
          priority={priorityOne}
          color={Colors.red[400]}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
});
