import { Pressable, Text, TextInput, View, Keyboard } from 'react-native';
import { CardStack } from '@/components/CardStack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { Select } from './ui/Select';
import { useChallengeStore } from '@/stores/challenge-provider';
import { TourGuideZone } from 'rn-tourguide';
export function Deck() {
  const challenges = useChallengeStore((store) => store.selectedChallenges);
  const language = useChallengeStore((store) => store.language);
  const setLanguage = useChallengeStore((store) => store.setLanguage);
  const sort = useChallengeStore((store) => store.toggleSort);
  const sortOrder = useChallengeStore((store) => store.sortOrder);
  const [filterText, setFilterText] = useState('');
  const setFilter = useChallengeStore((store) => store.setFilterString);
  const randomized = useChallengeStore((store) => store.randomized);
  const setRandomized = useChallengeStore((store) => store.setRandomized);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setFilter(filterText);
    });
    return () => {
      hideSubscription.remove();
    };
  }, [filterText, setFilter]);

  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }} className="flex-1 bg-purple-500 px-4">
      <View className="flex flex-row gap-2 ml-auto mt-4">
        <TextInput
          className="h-10 flex-1 px-4 py-2 rounded-2xl border border-gray-300 bg-white text-black"
          placeholder="e.g 1-12,33,40+"
          placeholderTextColor="#9CA3AF"
          onChangeText={(text) => {
            setFilterText(text);
          }}
        />
        <TourGuideZone
          text={'By default, all challenges are selected. Tap here to filter the challenges based on your input.'}
          zone={3}>
          <Pressable
            onPress={() => {
              setFilter(filterText);
              Keyboard.dismiss();
            }}
            className="p-2 bg-yellow-500 w-fit self-center rounded-2xl">
            <Text>Filter</Text>
          </Pressable>
        </TourGuideZone>
      </View>

      <View className="flex flex-row gap-2 items-center m-4 mx-auto">
        <TourGuideZone text={'You can randomize the order of the dohas for a fun trivia game!'} zone={4}>
          <Pressable
            className="bg-yellow-500 p-2 rounded-full w-fit"
            onPress={() => {
              setRandomized(!randomized);
            }}>
            <Text>Random ({randomized ? 'On' : 'Off'})</Text>
          </Pressable>
        </TourGuideZone>

        <TourGuideZone text={'Tap here to sort the challenges in ascending or descending order.'} zone={5}>
          <Pressable onPress={sort} className="p-2 bg-yellow-500 w-fit rounded-2xl">
            <Text>Sort ({sortOrder})</Text>
          </Pressable>
        </TourGuideZone>

        <TourGuideZone text={'You can read the dohas in Hindi or Transliterated Hindi.'} zone={6}>
          <Select
            onSelect={(value) => setLanguage(value as 'hi' | 'hi_trans')}
            options={[
              { label: 'Hindi', value: 'hi' },
              { label: 'Hindi (Transliterated)', value: 'hi_trans' }
            ]}
            btnText={`Lang (${language})`}
            btnClass="p-2 bg-yellow-500 rounded-2xl"
          />
        </TourGuideZone>
      </View>

      {challenges.length > 0 ? (
        <CardStack />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-center text-gray-500">
            No challenges selected. Please select some challenges to play with.
          </Text>
        </View>
      )}
    </View>
  );
}
