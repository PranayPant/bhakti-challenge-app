import Toast from 'react-native-toast-message';
import { createStore } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { filterChallenges, sortDohas, sortChallengesAndFlattenDohas } from './utils';
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
  sortOrder: string; // Sort order for the challenges
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
      selectedChallenges: hindiChallenges, // Initialize with an empty array
      dohas: hindiChallenges.flatMap((challenge) => challenge.dohas), // Initialize with an empty array
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
            dohas = sortChallengesAndFlattenDohas(state.selectedChallenges, state.sortOrder);
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
          const dohas: Doha[] = sortChallengesAndFlattenDohas(filteredChallenges, state.sortOrder);
          return {
            selectedChallenges: filteredChallenges,
            dohas: dohas,
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
          const sortedDohas = sortChallengesAndFlattenDohas(state.selectedChallenges, newSortOrder);

          return {
            sortOrder: newSortOrder,
            dohas: sortedDohas
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
        let sanityApiToken, sanityProjectId, sanityDataset, sanityApiVersion;
        if (process.env.EXPO_PUBLIC_ENV) {
          sanityApiToken = process.env.EXPO_PUBLIC_SANITY_API_TOKEN;
          sanityProjectId = process.env.EXPO_PUBLIC_SANITY_PROJECT_ID;
          sanityDataset = process.env.EXPO_PUBLIC_SANITY_DATASET;
          sanityApiVersion = process.env.EXPO_PUBLIC_SANITY_API_VERSION;
        } else {
          sanityApiToken = process.env.SANITY_API_TOKEN;
          sanityProjectId = process.env.SANITY_PROJECT_ID;
          sanityDataset = process.env.SANITY_DATASET;
          sanityApiVersion = process.env.SANITY_API_VERSION;
        }
        try {
          set({ isFetchingChallenges: true });
          // Fetch both English and Hindi challenges in parallel
          const queries = {
            english: `*[_type == 'english']|order(id){id,title,dohas,category,book}`,
            hindi: `*[_type == 'hindi']|order(id){id,title,dohas,category,book}`
          };

          const fetchChallenge = (lang: 'english' | 'hindi') =>
            fetch(`https://${sanityProjectId}.api.sanity.io/v${sanityApiVersion}/data/query/${sanityDataset}`, {
              headers: {
                Authorization: `Bearer ${sanityApiToken}`,
                'Content-Type': 'application/json',
                Accept: 'application/json'
              },
              method: 'POST',
              body: JSON.stringify({ query: queries[lang] })
            }).then((res) => res.json());

          const [englishJson, hindiJson] = await Promise.all([fetchChallenge('english'), fetchChallenge('hindi')]);

          Toast.show({
            type: 'success',
            text1: 'Successfully updated challenges!'
          });

          if (englishJson.result) {
            englishChallengesData = englishJson.result;
          } else {
            console.error('No English challenges found in the response.');
          }
          if (hindiJson.result) {
            hindiChallengesData = hindiJson.result;
          } else {
            console.error('No Hindi challenges found in the response.');
          }
        } catch (error) {
          Toast.show({
            type: 'error',
            text1: 'Failed to fetch challenges from remote.'
          });
          console.error('Failed to fetch challenges from remote:', error);
        } finally {
          set({ isFetchingChallenges: false });
        }

        try {
          await AsyncStorage.setItem(`challengesData_hindi`, JSON.stringify(hindiChallengesData));
          await AsyncStorage.setItem(`challengesData_english`, JSON.stringify(englishChallengesData));
        } catch (error) {
          console.error('Failed to save challenges data to AsyncStorage:', error);
        }
        const updatedChallengesState = await loadChallengesData(get().language, get().sortOrder, get().filterString);

        set(updatedChallengesState);
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
    console.log('No challenges found for the selected language:', language);
    return {};
  }

  let currentSelectedChallenges = challengesData;

  if (filterString) {
    currentSelectedChallenges = filterChallenges(currentSelectedChallenges, filterString);
  }

  let newDohas = sortChallengesAndFlattenDohas(currentSelectedChallenges, sortOrder);

  return {
    challengesData: [...challengesData],
    selectedChallenges: [...currentSelectedChallenges],
    dohas: newDohas
  };
};
