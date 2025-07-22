import { View, Text } from 'react-native';
import { clsx } from 'clsx';
import { useChallengeStore } from '@/stores/challenge-provider';
import { TourGuideZone } from 'rn-tourguide';

export interface FlashCardProps {
  index: number;
  dataIndex: number;
  mode?: 'quiz' | 'default';
}

export const FlashCard = ({ dataIndex, mode = 'default' }: FlashCardProps) => {
  const challenges = useChallengeStore((store) => store.selectedChallenges);
  const dohas = useChallengeStore((store) => store.dohas);
  const language = useChallengeStore((store) => store.language);

  const doha = dohas.at(dataIndex % dohas.length)!;

  const challenge = challenges.find((challenge) => challenge.id === doha.challengeId);

  return (
    <View className="h-[300px] rounded-lg m-4">
      <TourGuideZone
        zone={1}
        text="See the challenge name in yellow, challenge number in blue circle, and doha sequence (1-6) in small white circle.">
        <View className="ml-auto mb-4 flex flex-row ">
          <View className=" w-[250px] h-[48px] p-1 top-1 right-2 border border-white bg-yellow-300 rounded-xl">
            <Text className="text-blue-700 w-4/5 my-auto line-clamp-2 text-ellipsis text-center text-lg font-semibold">
              {challenge?.title || (language === 'hi' ? 'भक्ति चैलेंज' : 'Bhakti Challenge')}
            </Text>
          </View>
          <View className="absolute right-0 size-[56px] border border-white bg-blue-700 rounded-[999px]">
            <Text className="text-white m-auto text-lg">{challenge?.id}</Text>
            <View className="absolute bottom-0 right-0 size-[20px] bg-white rounded-[999px]">
              <Text className="m-auto text-sm">{doha.sequence}</Text>
            </View>
          </View>
        </View>
      </TourGuideZone>

      <TourGuideZone
        zone={2}
        tooltipBottomOffset={50}
        text="The doha is centered in the card. Swipe to cycle through the dohas of the selected challenge sequentially.">
        <View className="bg-white h-[250px] rounded-lg justify-center items-center gap-2 p-2">
          {mode === 'quiz' ? (
            <Text className="text-5xl text-center">?</Text>
          ) : (
            <>
              <Text
                className={clsx('text-center font-[NotoSansDevanagari]', language === 'hi' ? 'text-2xl' : 'text-xl')}>
                {doha.line1}
              </Text>
              <Text
                className={clsx('text-center font-[NotoSansDevanagari]', language === 'hi' ? 'text-2xl' : 'text-xl')}>
                {doha.line2}
              </Text>
            </>
          )}
        </View>
      </TourGuideZone>
    </View>
  );
};
