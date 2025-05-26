import { use } from "react";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export interface Challenge {
  id: number; // Unique identifier for the challenge
  title: string; // Title of the challenge
  dohas: Doha[]; // Array of dohas associated with the challenge
  category?: string; // Optional category for the challenge
  book?: string; // Book associated with the challenge
}

export type Doha = {
  line1: string;
  line2: string;
  sequence: number;
  challengeId: number;
};

export interface ChallengeStore {
  sortOrder: string; // Sort order for the challenges
  language: "hindi" | "english"; // Language of the challenges
  selectedChallengesData: Challenge[]; // Array of selected challenge data
  dohas: Doha[]; // Array of dohas associated with the challenges
  dataIndexOne: number; // Optional index for the first data item
  dataIndexTwo: number; // Optional index for the second data item
  dataIndexThree: number; // Optional index for the third data item
  toggleLanguage: () => void; // Function to toggle the language between Hindi and English
  toggleSortChallenges: () => void; // Function to sort challenges by ID
  setDataIndexOne: (index: number) => void; // Function to set the index for the first data item
  setDataIndexTwo: (index: number) => void; // Function to set the index for the second data item
  setDataIndexThree: (index: number) => void; // Function to set the index for the third data item
}

export const useChallengeStore = create(
  subscribeWithSelector<ChallengeStore>((set, get) => ({
    language: "hindi", // Default language
    sortOrder: "asc", // Default sort order
    selectedChallengesData: [],
    dohas: [], // Initialize with an empty array
    dataIndexOne: 0, // Default index for the first data item
    dataIndexTwo: 1, // Default index for the second data item
    dataIndexThree: 2, // Default index for the third data item
    toggleLanguage: () =>
      set((state) => ({
        language: state.language === "hindi" ? "english" : "hindi",
      })),

    toggleSortChallenges: () =>
      set((state) => ({
        sortOrder: state.sortOrder === "asc" ? "desc" : "asc",
      })),
    setDataIndexOne: (index: number) =>
      set(() => ({
        dataIndexOne: index,
      })),
    setDataIndexTwo: (index: number) =>
      set(() => ({
        dataIndexTwo: index,
      })),
    setDataIndexThree: (index: number) =>
      set(() => ({
        dataIndexThree: index,
      })),
  }))
);

useChallengeStore.subscribe(
  (state) => state.sortOrder,
  async (sortOrder) => {
    const challengesData = useChallengeStore.getState().selectedChallengesData;
    const sortedChallengeData = challengesData.sort(
      (a: Challenge, b: Challenge) =>
        sortOrder === "asc" ? a.id - b.id : b.id - a.id
    );
    const dohas: Doha[] = sortedChallengeData.flatMap(
      (challenge) => challenge.dohas
    );
    useChallengeStore.setState({
      selectedChallengesData: [...sortedChallengeData],
      dataIndexOne: 0,
      dataIndexTwo: 1,
      dataIndexThree: 2,
      dohas,
    });
  }
);

useChallengeStore.subscribe(
  (state) => state.language,
  async (language) => {
    let challengesData: Challenge[] = [];
    if (language === "english") {
      challengesData = (await import("@/data/english-challenges.json")).default;
    } else if (language === "hindi") {
      challengesData = (await import("@/data/hindi-challenges.json")).default;
    }
    const sortOrder = useChallengeStore.getState().sortOrder;
    const sortedChallengeData = challengesData.sort(
      (a: Challenge, b: Challenge) =>
        sortOrder === "asc" ? a.id - b.id : b.id - a.id
    );
    const dohas: Doha[] = sortedChallengeData.flatMap(
      (challenge) => challenge.dohas
    );
    useChallengeStore.setState({
      selectedChallengesData: [...sortedChallengeData],
      dohas,
    });
    challengesData = [];
  },
  {
    fireImmediately: true,
  }
);
