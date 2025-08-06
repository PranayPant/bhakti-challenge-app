import { Text, TextInput, View, Keyboard } from 'react-native';
import { CardStack } from '@/components/CardStack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { Select } from './ui/Select';
import { useChallengeStore } from '@/stores/challenge-provider';
import { TourGuideZone } from 'rn-tourguide';
import { Button } from 'react-native-paper';
export function Deck() {
  const insets = useSafeAreaInsets();
  const challenges = useChallengeStore((store) => store.selectedChallenges);
  const language = useChallengeStore((store) => store.language);
  const setLanguage = useChallengeStore((store) => store.setLanguage);
  const sort = useChallengeStore((store) => store.toggleSort);
  const sortOrder = useChallengeStore((store) => store.sortOrder);
  const [filterText, setFilterText] = useState('');
  const setFilter = useChallengeStore((store) => store.setFilterString);
  const randomized = useChallengeStore((store) => store.randomized);
  const setRandomized = useChallengeStore((store) => store.setRandomized);
  const isFetchingChallenges = useChallengeStore((store) => store.isFetchingChallenges);
  const fetchRemoteChallenges = useChallengeStore((store) => store.fetchRemoteChallenges);
  const initializeChallenges = useChallengeStore((store) => store.initializeChallenges);

  useEffect(() => {
    initializeChallenges();
  }, [initializeChallenges]);

  useEffect(() => {
    // Android only
    const didHideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setFilter(filterText);
    });
    // iOS only, faster
    const willHideSubscription = Keyboard.addListener('keyboardWillHide', () => {
      setFilter(filterText);
    });
    return () => {
      didHideSubscription.remove();
      willHideSubscription.remove();
    };
  }, [filterText, setFilter]);

  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }} className="flex-1 bg-purple-500 px-4">
      <View className="flex flex-row items-center gap-2 ml-auto mt-4">
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
          <Button
            mode="contained"
            buttonColor="#eab308"
            onPress={() => {
              setFilter(filterText);
              Keyboard.dismiss();
            }}>
            Filter
          </Button>
        </TourGuideZone>
      </View>

      <View className="flex flex-row flex-wrap gap-2 items-center m-4 mx-auto">
        <TourGuideZone text={'You can randomize the order of the dohas for a fun trivia game!'} zone={4}>
          <Button
            compact
            mode={randomized ? 'contained' : 'outlined'}
            buttonColor={randomized ? '#eab308' : '#fff'}
            textColor={randomized ? undefined : '#000'}
            onPress={() => {
              setRandomized(!randomized);
            }}>
            Rand ({randomized ? 'On' : 'Off'})
          </Button>
        </TourGuideZone>

        <TourGuideZone text={'Tap here to sort the challenges in ascending or descending order.'} zone={5}>
          <Button compact mode="contained" buttonColor="#eab308" onPress={sort}>
            Sort ({sortOrder})
          </Button>
        </TourGuideZone>

        <TourGuideZone text={'You can read the dohas in Hindi or Transliterated Hindi.'} zone={6}>
          <Select
            onSelect={(value) => setLanguage(value as 'hindi' | 'english')}
            options={[
              { label: 'Hindi', value: 'hindi' },
              { label: 'English', value: 'english' }
            ]}
            btnText={`${language === 'hindi' ? 'Hindi' : 'English'}`}
          />
        </TourGuideZone>
        <TourGuideZone text={'Get the latest challenges by refreshing.'} zone={7}>
          <Button
            compact
            mode="contained"
            disabled={isFetchingChallenges}
            loading={isFetchingChallenges}
            buttonColor="#eab308"
            icon={'download'}
            onPress={() => {
              fetchRemoteChallenges();
            }}>
            Update
          </Button>
        </TourGuideZone>
      </View>

      {challenges.length > 0 ? (
        <CardStack />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-center text-white">
            No challenges selected. Please select some challenges to play with.
          </Text>
        </View>
      )}
    </View>
  );
}
