import { useChallengeStore } from "@/stores/challenges";
import { useCallback, useEffect, useState } from "react";
import {
  useSharedValue,
  runOnJS,
  useAnimatedReaction,
} from "react-native-reanimated";

export const DECK_SIZE = 3;

export const useCardPriorities = () => {
  const cardIndexOrder = useSharedValue([0, 1, 2]);
  const priorityOne = useSharedValue(0);
  const priorityTwo = useSharedValue(1);
  const priorityThree = useSharedValue(2);
  const dataIndexOne = useSharedValue(0);
  const dataIndexTwo = useSharedValue(1);
  const dataIndexThree = useSharedValue(2);

  const filterString = useChallengeStore((store) => store.filterString);
  const sortOrder = useChallengeStore((store) => store.sortOrder);
  const setDataIndexOne = useChallengeStore((store) => store.setDataIndexOne);
  const setDataIndexTwo = useChallengeStore((store) => store.setDataIndexTwo);
  const setDataIndexThree = useChallengeStore(
    (store) => store.setDataIndexThree
  );
  const mode = useChallengeStore((store) => store.mode);
  const randomized = useChallengeStore((store) => store.randomized);

  const shuffle = useCallback(() => {
    "worklet";

    const newCardIndexOrder = [
      ...cardIndexOrder.value.slice(1),
      cardIndexOrder.value[0],
    ];
    cardIndexOrder.value = newCardIndexOrder;

    priorityOne.value = cardIndexOrder.value.findIndex((p) => p === 0);
    priorityTwo.value = cardIndexOrder.value.findIndex((p) => p === 1);
    priorityThree.value = cardIndexOrder.value.findIndex((p) => p === 2);

    if (newCardIndexOrder[0] === 0) {
      dataIndexThree.value = dataIndexOne.value + DECK_SIZE - 1;
    } else if (newCardIndexOrder[0] === DECK_SIZE - 1) {
      dataIndexOne.value = dataIndexOne.value + DECK_SIZE;
      dataIndexTwo.value = dataIndexTwo.value + DECK_SIZE;
    }
  }, [priorityOne, priorityTwo, priorityThree]);

  useEffect(() => {
    dataIndexOne.value = 0;
    dataIndexTwo.value = 1;
    dataIndexThree.value = 2;
    priorityOne.value = 0;
    priorityTwo.value = 1;
    priorityThree.value = 2;
  }, [sortOrder, filterString, randomized]);

  useAnimatedReaction(
    () => dataIndexOne.value,
    (dataIndexOne) => {
      runOnJS(setDataIndexOne)(dataIndexOne);
    }
  );

  useAnimatedReaction(
    () => dataIndexTwo.value,
    (dataIndexTwo) => {
      runOnJS(setDataIndexTwo)(dataIndexTwo);
    }
  );

  useAnimatedReaction(
    () => dataIndexThree.value,
    (dataIndexThree) => {
      runOnJS(setDataIndexThree)(dataIndexThree);
    }
  );

  return {
    shuffle,
    priorityOne,
    priorityTwo,
    priorityThree,
    dataIndexOne,
    dataIndexTwo,
    dataIndexThree,
  };
};
