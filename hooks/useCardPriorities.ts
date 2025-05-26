import { use, useCallback } from "react";
import { useSharedValue } from "react-native-reanimated";

export const DECK_SIZE = 3;

export const useCardPriorities = () => {
  const cardIndexOrder = useSharedValue([0, 1, 2]);
  const priorityOne = useSharedValue(0);
  const priorityTwo = useSharedValue(1);
  const priorityThree = useSharedValue(2);
  const dataIndexOne = useSharedValue(0);
  const dataIndexTwo = useSharedValue(1);
  const dataIndexThree = useSharedValue(2);

  const shuffle = useCallback(() => {
    "worklet";

    console.log("Current card index order:", cardIndexOrder.value);

    console.log(
      "Current card index priorities:",
      `card 0 (${priorityOne.value}) `,
      `card 1 (${priorityTwo.value}) `,
      `card 2 (${priorityThree.value}) `
    );

    const newCardIndexOrder = [
      ...cardIndexOrder.value.slice(1),
      cardIndexOrder.value[0],
    ];
    cardIndexOrder.value = newCardIndexOrder;

    console.log("Shuffled card index order:", cardIndexOrder.value);

    priorityOne.value = cardIndexOrder.value.findIndex((p) => p === 0);
    priorityTwo.value = cardIndexOrder.value.findIndex((p) => p === 1);
    priorityThree.value = cardIndexOrder.value.findIndex((p) => p === 2);

    console.log(
      "Shuffled priorities:",
      `card 0 (${priorityOne.value}) `,
      `card 1 (${priorityTwo.value}) `,
      `card 2 (${priorityThree.value}) `
    );

    if (newCardIndexOrder[0] === 0) {
      dataIndexThree.value = dataIndexOne.value + DECK_SIZE - 1;
    } else if (newCardIndexOrder[0] === DECK_SIZE - 1) {
      dataIndexOne.value = dataIndexOne.value + DECK_SIZE;
      dataIndexTwo.value = dataIndexTwo.value + DECK_SIZE;
    }

    console.log(
      "Card data indices:",
      `card 0 (${dataIndexOne.value}) `,
      `card 1 (${dataIndexTwo.value}) `,
      `card 2 (${dataIndexThree.value}) `
    );
  }, [priorityOne, priorityTwo, priorityThree]);

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
