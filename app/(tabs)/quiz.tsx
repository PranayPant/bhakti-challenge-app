import { Deck } from "@/components/Deck";
import { useChallengeStore } from "@/stores/challenges";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect } from "react";

export default function () {
  const setMode = useChallengeStore((store) => store.setMode);

  useFocusEffect(
    // Callback should be wrapped in `React.useCallback` to avoid running the effect too often.
    useCallback(() => {
      // Invoked whenever the route is focused.
      console.log("Hello, Quiz route focused!");
      setMode("quiz");

      // Return function is invoked whenever the route gets out of focus.
      return () => {
        console.log("Quiz route is now unfocused.");
      };
    }, [])
  );

  return <Deck />;
}
