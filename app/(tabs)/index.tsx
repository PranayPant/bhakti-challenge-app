import { Deck } from '@/components/Deck';
import { ChallengeStoreProvider } from '@/stores/challenge-provider';

export default function HomeTab() {
  return (
    <ChallengeStoreProvider>
      <Deck />
    </ChallengeStoreProvider>
  );
}
