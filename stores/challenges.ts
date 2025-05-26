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
  toggleLanguage: () => void; // Function to toggle the language between Hindi and English
  toggleSortChallenges: () => void; // Function to sort challenges by ID
}

export const useChallengeStore = create(
  subscribeWithSelector<ChallengeStore>((set, get) => ({
    language: "hindi", // Default language
    sortOrder: "asc", // Default sort order
    selectedChallengesData: [],

    toggleLanguage: () =>
      set((state) => ({
        language: state.language === "hindi" ? "english" : "hindi",
      })),

    toggleSortChallenges: () =>
      set((state) => ({
        sortOrder: state.sortOrder === "asc" ? "desc" : "asc",
        selectedChallengesData: [
          ...state.selectedChallengesData.sort((a: Challenge, b: Challenge) =>
            state.sortOrder === "asc" ? b.id - a.id : a.id - b.id
          ),
        ],
      })),
  }))
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
    useChallengeStore.setState({
      selectedChallengesData: [
        ...challengesData.sort((a: Challenge, b: Challenge) =>
          sortOrder === "asc" ? a.id - b.id : b.id - a.id
        ),
      ],
    });
    challengesData = [];
  },
  {
    fireImmediately: true,
  }
);
