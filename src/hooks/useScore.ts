/**
 * Custom hook for tracking quiz score and streak state.
 *
 * Maintains a running tally of correct/incorrect answers, current streak,
 * and best streak achieved during the session.
 */

import { useState, useCallback } from "react";
import type { ScoreState } from "../types/questions";

/** Initial score state at the start of a session. */
const INITIAL_SCORE: ScoreState = {
  correct: 0,
  incorrect: 0,
  streak: 0,
  bestStreak: 0,
  totalAnswered: 0,
};

/**
 * Hook for managing score state during a study session.
 *
 * @returns Current score state and a function to record an answer result.
 */
export function useScore() {
  const [score, setScore] = useState<ScoreState>(INITIAL_SCORE);

  /**
   * Record the result of a question answer.
   * Updates correct/incorrect counts, streak tracking, and total answered.
   *
   * @param isCorrect - Whether the user's answer was correct
   */
  const recordAnswer = useCallback((isCorrect: boolean) => {
    setScore((prev) => {
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      return {
        correct: prev.correct + (isCorrect ? 1 : 0),
        incorrect: prev.incorrect + (isCorrect ? 0 : 1),
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
        totalAnswered: prev.totalAnswered + 1,
      };
    });
  }, []);

  /** Reset score state to initial values. */
  const resetScore = useCallback(() => {
    setScore(INITIAL_SCORE);
  }, []);

  return { score, recordAnswer, resetScore };
}
