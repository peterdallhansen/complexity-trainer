/**
 * Type definitions for the Complexity Trainer question system.
 *
 * Defines two question formats modeled after DTU Algoritmer exam questions:
 * - Algorithm complexity analysis (pseudocode → Big-O selection)
 * - True/false asymptotic notation statements (Yes/No)
 */

/** All possible Big-O complexity options presented to the student. */
export const COMPLEXITY_OPTIONS = [
  "O(1)",
  "O(\\log n)",
  "O(\\sqrt{n})",
  "O(n)",
  "O(n \\log n)",
  "O(n^2)",
  "O(n^2 \\log n)",
  "O(n^3)",
  "O(2^n)",
] as const;

export type ComplexityOption = (typeof COMPLEXITY_OPTIONS)[number];

/**
 * Type 1: A pseudocode algorithm with its correct Big-O complexity.
 * The student sees the pseudocode and must select the tightest bound.
 */
export interface AlgorithmQuestion {
  type: "algorithm";
  /** The algorithm's display name (e.g., "ALG1") */
  name: string;
  /** Lines of pseudocode to display */
  pseudocode: string[];
  /** The function parameter name (typically "n") */
  parameter: string;
  /** The correct Big-O answer in LaTeX (must match one of COMPLEXITY_OPTIONS) */
  correctAnswer: ComplexityOption;
  /** Step-by-step explanation of why this is the correct complexity */
  explanation: string;
}

/**
 * Type 2: An asymptotic notation statement that is either correct or incorrect.
 * The student sees the LaTeX expression and marks Yes or No.
 */
export interface TrueFalseQuestion {
  type: "trueFalse";
  /** LaTeX expression of the full statement (e.g., "n^3 + 5n^2 = \\Theta(n^3)") */
  latex: string;
  /** Whether the statement is mathematically correct */
  isCorrect: boolean;
  /** Explanation of why the statement is correct or incorrect */
  explanation: string;
}

/** Union type for all question formats. */
export type Question = AlgorithmQuestion | TrueFalseQuestion;

/**
 * The user's answer for a given question.
 * - For algorithm questions: the selected ComplexityOption
 * - For true/false questions: boolean (Yes = true, No = false)
 */
export type UserAnswer = ComplexityOption | boolean | null;

/** Score tracking state for the session. */
export interface ScoreState {
  correct: number;
  incorrect: number;
  streak: number;
  bestStreak: number;
  totalAnswered: number;
}
