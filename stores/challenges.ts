import { create } from "zustand";

export interface ChallengeStore {
  selectedChallenges: string[]; // Array of selected challenge IDs
  addSelectedChallenge: (challenge: string) => void; // Function to add a challenge ID to the selectedChallenges array
  removeSelectedChallenge: (challenge: string) => void; // Function to remove a challenge ID from the selectedChallenges array
  clearSelectedChallenges: () => void; // Function to clear the selectedChallenges array
  toggleSelectedChallenge: (challenge: string) => void; // Function to toggle the selection of a challenge ID
  setSelectedChallenges: (challenges: string[]) => void; // Function to set the selectedChallenges array to a new array of challenge IDs
}

export const useChallengeStore = create<ChallengeStore>((set) => ({
  selectedChallenges: [],
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
  clearSelectedChallenges: () =>
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
}));
