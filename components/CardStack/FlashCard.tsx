import { Doha, useChallengeStore } from "@/stores/challenges";
import { View, Text } from "react-native";

export interface FlashCardProps {
  doha: Doha;
}

export const FlashCard = ({ doha }: FlashCardProps) => {
  const selectedChallengesData = useChallengeStore(
    (store) => store.selectedChallengesData
  );

  return (
    <View className="h-[300px] rounded-lg m-4">
      <View className="ml-auto mb-4 flex flex-row ">
        <View className=" w-[200px] h-[48px] p-1 top-1 right-2 border border-white bg-yellow-300 rounded-xl">
          <Text className="text-blue-700 my-auto ml-3 w-[120px] text-center text-pretty break-normal text-md font-semibold">
            {selectedChallengesData[doha.challengeId - 1].title ||
              "Bhakti Challenge"}
          </Text>
        </View>
        <View className="absolute right-0 size-[56px] border border-white bg-blue-700 rounded-[999px]">
          <Text className="text-white m-auto text-lg">
            {selectedChallengesData[doha.challengeId - 1].id}
          </Text>
        </View>
      </View>

      <View className="bg-white h-[250px] rounded-lg justify-center items-center gap-2 p-2">
        <Text className="text-xl text-center">{doha.line1}</Text>
        <Text className="text-xl text-center">{doha.line2}</Text>
      </View>
    </View>
  );
};
