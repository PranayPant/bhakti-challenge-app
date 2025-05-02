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
  line: number;
};

export interface ChallengeStore {
  language: "hindi" | "english"; // Language of the challenges
  selectedChallenges: string[]; // Array of selected challenge IDs
  selectedChallengesData: Challenge[]; // Array of selected challenge data
  addSelectedChallenge: (challenge: string) => void; // Function to add a challenge ID to the selectedChallenges array
  removeSelectedChallenge: (challenge: string) => void; // Function to remove a challenge ID from the selectedChallenges array
  clearAllChallenges: () => void; // Function to clear the selectedChallenges array
  toggleSelectedChallenge: (challenge: string) => void; // Function to toggle the selection of a challenge ID
  setSelectedChallenges: (challenges: string[]) => void; // Function to set the selectedChallenges array to a new array of challenge IDs
  toggleAllChallenges: (challenges: string[]) => void; // Function to toggle all challenges in the selectedChallenges array
}

export const useChallengeStore = create(
  subscribeWithSelector<ChallengeStore>((set, get) => ({
    language: "hindi", // Default language
    selectedChallenges: [],
    selectedChallengesData: [],
    addSelectedChallenge: (challenge) =>
      set((state) => ({
        selectedChallenges: [...state.selectedChallenges, challenge],
      })),
    removeSelectedChallenge: (challenge) =>
      set((state) => ({
        selectedChallenges: state.selectedChallenges.filter(
          (id) => id !== challenge
        ),
      })),
    clearAllChallenges: () =>
      set(() => ({
        selectedChallenges: [],
      })),
    setSelectedChallenges: (challenges) =>
      set(() => ({
        selectedChallenges: challenges,
      })),
    toggleSelectedChallenge: (challenge) =>
      set((state) => ({
        selectedChallenges: state.selectedChallenges.includes(challenge)
          ? state.selectedChallenges.filter((id) => id !== challenge)
          : [...state.selectedChallenges, challenge],
      })),
    toggleAllChallenges: (challenges) =>
      set((state) => ({
        selectedChallenges:
          state.selectedChallenges.length === challenges.length
            ? []
            : challenges,
      })),
  }))
);

useChallengeStore.subscribe(
  (state) => state.language,
  async (language) => {
    let challengesData;
    if (language === "english") {
      challengesData = await import(`@/data/english-challenges.json`);
    } else if (language === "hindi") {
      challengesData = await import(`@/data/hindi-challenges.json`);
    }
    console.log("language set to", language);
    useChallengeStore.setState({
      selectedChallengesData: challengesData?.default,
    });
    challengesData = null;
  },
  {
    fireImmediately: true,
  }
);
