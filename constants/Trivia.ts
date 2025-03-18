import { Asset } from "expo-asset";
import { ScrollListItem } from "@/components/ScrollableCards/ScrollableCard";

export interface TriviaCard {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

export const Trivia: TriviaCard[] = [
  {
    id: 1,
    question: "What is the capital of France?",
    options: ["Madrid", "Rome", "Paris", "Lisbon"],
    correctAnswer: "Paris",
  },
  {
    id: 2,
    question: "What is the capital of Spain?",
    options: ["Madrid", "Rome", "Paris", "Lisbon"],
    correctAnswer: "Madrid",
  },
  {
    id: 3,
    question: "What is the capital of Portugal?",
    options: ["Madrid", "Rome", "Paris", "Lisbon"],
    correctAnswer: "Lisbon",
  },
  {
    id: 4,
    question: "What is the capital of Italy?",
    options: ["Madrid", "Rome", "Paris", "Lisbon"],
    correctAnswer: "Rome",
  },
  {
    id: 5,
    question: "What is the capital of Germany?",
    options: ["Berlin", "Rome", "Paris", "Lisbon"],
    correctAnswer: "Berlin",
  },
  {
    id: 6,
    question: "What is the capital of the United Kingdom?",
    options: ["Madrid", "London", "Paris", "Lisbon"],
    correctAnswer: "London",
  },
  {
    id: 7,
    question: "What is the capital of the United States?",
    options: ["Washington D.C.", "Rome", "Paris", "Lisbon"],
    correctAnswer: "Washington D.C.",
  },
  {
    id: 8,
    question: "What is the capital of Canada?",
    options: ["Madrid", "Rome", "Ottawa", "Lisbon"],
    correctAnswer: "Ottawa",
  },
  {
    id: 9,
    question: "What is the capital of Brazil?",
    options: ["Madrid", "Rome", "Paris", "Brasília"],
    correctAnswer: "Brasília",
  },
  {
    id: 10,
    question: "What is the capital of Australia?",
    options: ["Madrid", "Rome", "Canberra", "Lisbon"],
    correctAnswer: "Canberra",
  },
];

export const ScrollableItems: Partial<ScrollListItem>[] = [
  {
    asset: Asset.loadAsync(require("@/assets/images/image_01.png")),
  },
  {
    asset: require("@/assets/images/image_02.jpg"),
  },
  {
    asset: require("@/assets/images/image_03.jpg"),
  },
  {
    asset: require("@/assets/images/image_04.jpg"),
  },
  {
    asset: require("@/assets/images/image_02.jpg"),
  },
  {
    asset: require("@/assets/images/image_03.jpg"),
  },
  {
    asset: require("@/assets/images/image_04.jpg"),
  },
];
