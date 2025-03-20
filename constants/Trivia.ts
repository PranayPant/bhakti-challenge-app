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
  {
    id: 11,
    question: "What is the capital of Japan?",
    options: ["Tokyo", "Seoul", "Beijing", "Bangkok"],
    correctAnswer: "Tokyo",
  },
  {
    id: 12,
    question: "What is the capital of China?",
    options: ["Tokyo", "Seoul", "Beijing", "Bangkok"],
    correctAnswer: "Beijing",
  },
  {
    id: 13,
    question: "What is the capital of South Korea?",
    options: ["Tokyo", "Seoul", "Beijing", "Bangkok"],
    correctAnswer: "Seoul",
  },
  {
    id: 14,
    question: "What is the capital of Thailand?",
    options: ["Tokyo", "Seoul", "Beijing", "Bangkok"],
    correctAnswer: "Bangkok",
  },
  {
    id: 15,
    question: "What is the capital of Russia?",
    options: ["Moscow", "Saint Petersburg", "Kiev", "Minsk"],
    correctAnswer: "Moscow",
  },
  {
    id: 16,
    question: "What is the capital of India?",
    options: ["New Delhi", "Mumbai", "Kolkata", "Chennai"],
    correctAnswer: "New Delhi",
  },
  {
    id: 17,
    question: "What is the capital of Mexico?",
    options: ["Mexico City", "Guadalajara", "Monterrey", "Tijuana"],
    correctAnswer: "Mexico City",
  },
  {
    id: 18,
    question: "What is the capital of Argentina?",
    options: ["Buenos Aires", "Santiago", "Lima", "Bogotá"],
    correctAnswer: "Buenos Aires",
  },
  {
    id: 19,
    question: "What is the capital of Egypt?",
    options: ["Cairo", "Alexandria", "Giza", "Luxor"],
    correctAnswer: "Cairo",
  },
  {
    id: 20,
    question: "What is the capital of South Africa?",
    options: ["Pretoria", "Cape Town", "Johannesburg", "Durban"],
    correctAnswer: "Pretoria",
  }
];
