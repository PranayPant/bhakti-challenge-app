import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { filterChallenges, sortDohas } from "./utils";
import englishChallenges from "@/data/english-challenges.json";
import hindiChallenges from "@/data/hindi-challenges.json";

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

export interface ChallengeStore {
  sortOrder: string; // Sort order for the challenges
  language: "hindi" | "english"; // Language of the challenges
  challengesData: Challenge[]; // Array of selected challenge data
  selectedChallenges: Challenge[]; // Array of selected challenges
  dohas: Doha[]; // Array of dohas associated with the challenges
  dataIndexOne: number; // Optional index for the first data item
  dataIndexTwo: number; // Optional index for the second data item
  dataIndexThree: number; // Optional index for the third data item
  filterString: string; // String to filter challenges by ID or title
  mode: "quiz" | "default"; // Mode of the deck, either quiz or default
  randomized: boolean; // Flag to indicate if the challenges are randomized
  goBackwards: VoidFunction; // Function to go backwards in the deck
  toggleLanguage: () => void; // Function to toggle the language between Hindi and English
  toggleSort: () => void; // Function to sort challenges by ID
  setDataIndexOne: (index: number) => void; // Function to set the index for the first data item
  setDataIndexTwo: (index: number) => void; // Function to set the index for the second data item
  setDataIndexThree: (index: number) => void; // Function to set the index for the third data item
  setFilterString: (filter: string) => void; // Function to set the filter string
  setMode: (mode: "quiz" | "default") => void; // Function to set the mode of the deck
  setRandomized: (randomized: boolean) => void; // Function to set the randomized flag
}

export const useChallengeStore = create(
  subscribeWithSelector<ChallengeStore>((set, get) => ({
    language: "hindi", // Default language
    sortOrder: "asc", // Default sort order
    challengesData: [],
    selectedChallenges: [], // Initialize with an empty array
    dohas: [], // Initialize with an empty array
    dataIndexOne: 0, // Default index for the first data item
    dataIndexTwo: 1, // Default index for the second data item
    dataIndexThree: 2, // Default index for the third data item
    filterString: "", // Initialize with an empty string
    mode: "default", // Default mode of the deck
    randomized: false, // Default randomized state
    goBackwards: () => {
      set((state) => {
        const dohas = [...state.dohas];
        dohas.unshift(dohas.pop()!); // Move the last doha to the front
        return {
          dohas,
        };
      });
    },
    setMode: (mode: "quiz" | "default") => {
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
          dohas,
        };
      });
    },
    setFilterString: (filter: string) => {
      set((state) => {
        const filteredChallenges = filterChallenges(
          state.challengesData,
          filter
        );
        const dohas: Doha[] = filteredChallenges.flatMap(
          (challenge) => challenge.dohas
        );
        const sortedDohas = sortDohas(dohas, state.sortOrder);
        return {
          selectedChallenges: filteredChallenges,
          dohas: sortedDohas,
          filterString: filter,
        };
      });
    },
    toggleLanguage: () =>
      set((state) => ({
        language: state.language === "hindi" ? "english" : "hindi",
      })),

    toggleSort: () => {
      set((state) => {
        const newSortOrder = state.sortOrder === "asc" ? "desc" : "asc";
        const sortedDohas = sortDohas(state.dohas, newSortOrder);

        return {
          sortOrder: newSortOrder,
          dohas: sortedDohas,
        };
      });
    },
    setDataIndexOne: (index: number) =>
      set((state) => ({
        dataIndexOne: index % state.dohas.length,
      })),
    setDataIndexTwo: (index: number) =>
      set((state) => ({
        dataIndexTwo: index % state.dohas.length,
      })),
    setDataIndexThree: (index: number) =>
      set((state) => ({
        dataIndexThree: index % state.dohas.length,
      })),
  }))
);

useChallengeStore.subscribe(
  (state) => state.language,
  async (language) => {
    let challengesData: Challenge[] = [];
    if (language === "english") {
      challengesData = englishChallenges;
    } else if (language === "hindi") {
      challengesData = hindiChallenges;
    }

    if (challengesData.length === 0) {
      console.log("No challenges found for the selected language:", language);
      return;
    }

    let currentSelectedChallenges =
      useChallengeStore.getState().selectedChallenges;

    currentSelectedChallenges = currentSelectedChallenges.length
      ? currentSelectedChallenges
      : challengesData;
    const newSelectedChallenges = currentSelectedChallenges.map((challenge) => {
      const newChallenge = challengesData.find((c) => c.id === challenge.id);
      return newChallenge ? { ...newChallenge } : challenge;
    });

    let currentDohas = useChallengeStore.getState().dohas;

    currentDohas = currentDohas.length
      ? currentDohas
      : challengesData.flatMap((challenge) => challenge.dohas);

    const newDohas = currentDohas.map((doha) => {
      const newDoha = newSelectedChallenges
        .find((c) => c.id === doha.challengeId)
        ?.dohas.find((newDoha) => newDoha.sequence === doha.sequence);
      return newDoha ? { ...doha } : doha;
    });

    useChallengeStore.setState({
      challengesData: [...challengesData],
      selectedChallenges: newSelectedChallenges,
      dohas: newDohas,
    });
    challengesData = [];
  },
  {
    fireImmediately: true,
  }
);
