import Toast from 'react-native-toast-message';
import { createStore } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { filterChallenges, sortDohas } from './utils';
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
            dohas = sortDohas(dohas, state.sortOrder);
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
          const dohas: Doha[] = filteredChallenges.flatMap((challenge) => challenge.dohas);
          const sortedDohas = sortDohas(dohas, state.sortOrder);
          return {
            selectedChallenges: filteredChallenges,
            dohas: sortedDohas,
            filterString: filter,
            randomized: false
          };
        });
      },
      async setLanguage(language) {
        const updatedState = await loadChallengesData(
          language,
          get().selectedChallenges,
          get().dohas,
          get().filterString
        );
        set({ language, ...updatedState });
      },

      toggleSort: () => {
        set((state) => {
          const newSortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
          const sortedDohas = sortDohas(state.dohas, newSortOrder);

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
        const updatedState = await loadChallengesData(
          get().language,
          get().selectedChallenges,
          get().dohas,
          get().filterString
        );
        set(updatedState);
      },
      fetchRemoteChallenges: async () => {
        const currentLang = get().language;
        let challengesData: Challenge[] = [];
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
          const challengesResponse = await fetch(
            `https://${sanityProjectId}.api.sanity.io/v${sanityApiVersion}/data/query/${sanityDataset}`,
            {
              headers: {
                Authorization: `Bearer ${sanityApiToken}`,
                'Content-Type': 'application/json',
                Accept: 'application/json'
              },
              method: 'POST',
              body: JSON.stringify({
                query: `*[_type == '${currentLang}']|order(id){id,title,dohas,category,book}`
              })
            }
          );
          console.log('Challenges fetched from remote:', challengesResponse.status);
          Toast.show({
            type: 'success',
            text1: 'Challenges fetched successfully from remote.'
          });

          const json = await challengesResponse.json();
          challengesData = json.result;
        } catch (error) {
          Toast.show({
            type: 'error',
            text1: 'Failed to fetch challenges from remote.'
          });
          console.error('Failed to fetch challenges from remote:', error);
          challengesData = get().challengesData;
        } finally {
          set({ isFetchingChallenges: false });
        }

        try {
          await AsyncStorage.setItem(`challengesData_${currentLang}`, JSON.stringify(challengesData));
        } catch (error) {
          console.error('Failed to save challenges data to AsyncStorage:', error);
        }
        const updatedChallengesState = await loadChallengesData(
          get().language,
          get().selectedChallenges,
          get().dohas,
          get().filterString
        );

        set(updatedChallengesState);
      }
    }))
  );
};

export const loadChallengesData = async (
  language: ChallengeStore['language'],
  selectedChallenges: Challenge[],
  selectedDohas: Doha[],
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

  let currentSelectedChallenges = selectedChallenges;

  currentSelectedChallenges = currentSelectedChallenges.length ? currentSelectedChallenges : challengesData;
  if (filterString) {
    currentSelectedChallenges = filterChallenges(currentSelectedChallenges, filterString);
  }
  const newSelectedChallenges = currentSelectedChallenges.map((challenge) => {
    const newChallenge = challengesData.find((c) => c.id === challenge.id);
    return newChallenge ? { ...newChallenge } : challenge;
  });

  let currentDohas = selectedDohas;

  currentDohas = currentDohas.length ? currentDohas : currentSelectedChallenges.flatMap((challenge) => challenge.dohas);

  const newDohas = currentDohas.map((doha) => {
    const newDoha = newSelectedChallenges
      .find((c) => c.id === doha.challengeId)
      ?.dohas.find((newDoha) => newDoha.sequence === doha.sequence);
    return newDoha ? { ...newDoha } : doha;
  });

  return {
    challengesData: [...challengesData],
    selectedChallenges: newSelectedChallenges,
    dohas: newDohas
  };
};
