import { Deck } from "@/components/Deck";
import { ChallengeStoreProvider } from "@/stores/challenge-provider";

export default function () {
  return (
    <ChallengeStoreProvider>
      <Deck />
    </ChallengeStoreProvider>
  );
}
