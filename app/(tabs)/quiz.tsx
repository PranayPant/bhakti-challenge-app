import { Deck } from '@/components/Deck';
import { ChallengeStoreProvider } from '@/stores/challenge-provider';

export default function QuizTab() {
  return (
    <ChallengeStoreProvider initialStore={{ mode: 'quiz' }}>
      <Deck />
    </ChallengeStoreProvider>
  );
}
