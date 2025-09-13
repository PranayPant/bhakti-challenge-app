import Toast from 'react-native-toast-message';
import { createStore } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { filterChallenges, sortChallenges } from './utils';
import englishChallenges from '@/data/english-challenges.json';
import hindiChallenges from '@/data/hindi-challenges.json';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Challenge {
  id: number; // Unique identifier for the challenge
  title: string; // Title of the challenge
  dohas: Doha[]; // Array of dohas associated with the challenge
  category?: string; // Optional category for the challenge
  book?: string; // Book associated with the challenge
}

export type Doha = {
  id: number; // Unique identifier for the doha
  line1: string;
  line2: string;
  sequence: number;
  challengeId: number;
};

export interface ChallengeStoreState {
  sortOrder: 'asc' | 'desc'; // Sort order for the challenges
  language: 'hindi' | 'english'; // Language of the challenges
  challengesData: Challenge[]; // Array of selected challenge data
  selectedChallenges: Challenge[]; // Array of selected challenges
  dohas: Doha[]; // Array of dohas associated with the challenges
  dataIndexOne: number; // Optional index for the first data item
  dataIndexTwo: number; // Optional index for the second data item
  dataIndexThree: number; // Optional index for the third data item
  filterString: string; // String to filter challenges by ID or title
  mode: 'quiz' | 'default'; // Mode of the deck, either quiz or default
  randomized: boolean; // Flag to indicate if the challenges are randomized
  isFetchingChallenges: boolean; // Flag to indicate if remote challenges are being fetched
}

export interface ChallengeStoreActions {
  goBackwards: VoidFunction; // Function to go backwards in the deck
  setLanguage: (language: ChallengeStoreState['language']) => void; // Function to toggle the language between Hindi and English
  toggleSort: () => void; // Function to sort challenges by ID
  setDataIndexOne: (index: number) => void; // Function to set the index for the first data item
  setDataIndexTwo: (index: number) => void; // Function to set the index for the second data item
  setDataIndexThree: (index: number) => void; // Function to set the index for the third data item
  setFilterString: (filter: string) => void; // Function to set the filter string
  setMode: (mode: 'quiz' | 'default') => void; // Function to set the mode of the deck
  setRandomized: (randomized: boolean) => void; // Function to set the randomized flag
  fetchRemoteChallenges: () => Promise<void>; // Function to fetch challenges from a remote source
  initializeChallenges: () => Promise<void>; // Function to initialize challenges from local storage or default data
}

export type ChallengeStore = ChallengeStoreState & ChallengeStoreActions;

export const createChallengeStore = (initProps?: Partial<ChallengeStore>) => {
  return createStore(
    subscribeWithSelector<ChallengeStore>((set, get) => ({
      language: 'hindi', // Default language
      sortOrder: 'asc', // Default sort order
      challengesData: hindiChallenges,
      selectedChallenges: hindiChallenges,
      dohas: hindiChallenges.flatMap((challenge) => challenge.dohas),
      dataIndexOne: 0, // Default index for the first data item
      dataIndexTwo: 1, // Default index for the second data item
      dataIndexThree: 2, // Default index for the third data item
      filterString: '', // Initialize with an empty string
      mode: 'default', // Default mode of the deck
      randomized: false, // Default randomized state
      isFetchingChallenges: false, // Default fetching state
      ...initProps, // Spread any initial properties passed in
      goBackwards: () => {
        set((state) => {
          const dohas = [...state.dohas];
          dohas.unshift(dohas.pop()!); // Move the last doha to the front
          return {
            dohas
          };
        });
      },
      setMode: (mode: 'quiz' | 'default') => {
        set({ mode });
      },
      setRandomized: (randomized: boolean) => {
        set((state) => {
          let dohas = [...state.dohas];
          if (randomized) {
            dohas.sort(() => Math.random() - 0.5);
          } else {
            const sorted = sortChallenges(state.selectedChallenges, state.sortOrder);
            dohas = sorted.dohas;
          }
          return {
            randomized,
            dohas
          };
        });
      },
      setFilterString: (filter: string) => {
        set((state) => {
          const filteredChallenges = filterChallenges(state.challengesData, filter);
          const sorted = sortChallenges(filteredChallenges, state.sortOrder);
          return {
            selectedChallenges: sorted.challenges,
            dohas: sorted.dohas,
            filterString: filter,
            randomized: false
          };
        });
      },
      async setLanguage(language) {
        const updatedState = await loadChallengesData(language, get().sortOrder, get().filterString);
        set({ language, ...updatedState });
      },

      toggleSort: () => {
        set((state) => {
          const newSortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
          const sorted = sortChallenges(state.selectedChallenges, newSortOrder);

          return {
            sortOrder: newSortOrder,
            selectedChallenges: sorted.challenges,
            dohas: sorted.dohas
          };
        });
      },
      setDataIndexOne: (index: number) =>
        set((state) => ({
          dataIndexOne: index % state.dohas.length
        })),
      setDataIndexTwo: (index: number) =>
        set((state) => ({
          dataIndexTwo: index % state.dohas.length
        })),
      setDataIndexThree: (index: number) =>
        set((state) => ({
          dataIndexThree: index % state.dohas.length
        })),
      initializeChallenges: async () => {
        const updatedState = await loadChallengesData(get().language, get().sortOrder, get().filterString);
        set(updatedState);
      },
      fetchRemoteChallenges: async () => {
        let englishChallengesData: Challenge[] = [];
        let hindiChallengesData: Challenge[] = [];
        const sanityApiToken = process.env.EXPO_PUBLIC_SANITY_API_TOKEN;
        const sanityProjectId = process.env.EXPO_PUBLIC_SANITY_PROJECT_ID;
        const sanityDataset = process.env.EXPO_PUBLIC_SANITY_DATASET;
        const sanityApiVersion = process.env.EXPO_PUBLIC_SANITY_API_VERSION;

        set({ isFetchingChallenges: true });

        try {
          // Fetch both English and Hindi challenges in parallel
          const queries = {
            english: `*[_type == 'english']|order(id){id,title,dohas,category,book}`,
            hindi: `*[_type == 'hindi']|order(id){id,title,dohas,category,book}`
          };

          const fetchChallenge = async (lang: 'english' | 'hindi') => {
            const response = await fetch(
              `https://${sanityProjectId}.api.sanity.io/v${sanityApiVersion}/data/query/${sanityDataset}`,
              {
                headers: {
                  Authorization: `Bearer ${sanityApiToken}`,
                  'Content-Type': 'application/json',
                  Accept: 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({ query: queries[lang] })
              }
            );
            if (!response.ok) {
              throw new Error(`Failed to fetch ${lang} challenges: ${response.statusText}`);
            }
            return await response.json();
          };

          const [englishJson, hindiJson] = await Promise.all([fetchChallenge('english'), fetchChallenge('hindi')]);

          if (englishJson.result && englishJson.result.length > 0) {
            englishChallengesData = englishJson.result;
          } else {
            console.error('No English challenges found in the response.');
            throw new Error('Failed to fetch English challenges: Empty or invalid response');
          }
          if (hindiJson.result && hindiJson.result.length > 0) {
            hindiChallengesData = hindiJson.result;
          } else {
            console.error('No Hindi challenges found in the response.');
            throw new Error('Failed to fetch Hindi challenges: Empty or invalid response');
          }

          Toast.show({
            type: 'success',
            text1: 'Successfully updated challenges!'
          });
        } catch (error) {
          Toast.show({
            type: 'error',
            text1: 'Failed to fetch challenges from remote.'
          });
          console.error('Failed to fetch challenges from remote:', error);
          throw error; // Re-throw the error so callers can handle it
        } finally {
          set({ isFetchingChallenges: false });
        }

        if (hindiChallengesData.length > 0 && englishChallengesData.length > 0) {
          try {
            await AsyncStorage.setItem(`challengesData_hindi`, JSON.stringify(hindiChallengesData));
            await AsyncStorage.setItem(`challengesData_english`, JSON.stringify(englishChallengesData));

            const updatedChallengesState = await loadChallengesData(
              get().language,
              get().sortOrder,
              get().filterString
            );
            set(updatedChallengesState);
          } catch (error) {
            console.error('Failed to save challenges data to AsyncStorage:', error);
            throw new Error('Failed to save challenges data to local storage');
          }
        }
      }
    }))
  );
};

export const loadChallengesData = async (
  language: ChallengeStore['language'],
  sortOrder: ChallengeStore['sortOrder'] = 'asc',
  filterString: string = ''
) => {
  let challengesData: Challenge[] = [];
  let storedChallenges: Challenge[] | null = null;

  try {
    const storedChallengesString = await AsyncStorage.getItem(`challengesData_${language}`);
    storedChallenges = storedChallengesString ? JSON.parse(storedChallengesString) : null;
  } catch (error) {
    console.error('Failed to get challenges data from AsyncStorage:', error);
  }

  if (storedChallenges) {
    challengesData = storedChallenges;
  } else if (language === 'english') {
    challengesData = englishChallenges;
  } else if (language === 'hindi') {
    challengesData = hindiChallenges;
  }

  if (challengesData.length === 0) {
    return {};
  }

  let currentSelectedChallenges = challengesData;

  if (filterString) {
    currentSelectedChallenges = filterChallenges(currentSelectedChallenges, filterString);
  }

  const sorted = sortChallenges(currentSelectedChallenges, sortOrder);

  return {
    challengesData: [...challengesData],
    selectedChallenges: sorted.challenges,
    dohas: sorted.dohas
  };
};
