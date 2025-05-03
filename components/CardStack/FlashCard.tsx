import { Challenge, Doha, useChallengeStore } from "@/stores/challenges";
import { View, Text } from "react-native";

export interface FlashCardProps {
  doha: Doha;
}

export const FlashCard = ({ doha }: FlashCardProps) => {
  const selectedChallengesData = useChallengeStore(
    (store) => store.selectedChallengesData
  );

  return (
    <View>
      <Text>Bhakti Challenge {doha.challengeId}</Text>
      <Text>{selectedChallengesData[doha.challengeId].title}</Text>
      <Text>{doha.line1}</Text>
      <Text>{doha.line2}</Text>
      <Text>Line: {doha.line}</Text>
    </View>
  );
};
