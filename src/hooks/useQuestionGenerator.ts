/**
 * Custom hook for managing the question generation queue.
 *
 * Pre-generates a batch of 10 questions on mount, serves them one at a time,
 * and automatically refills the queue when it drops below 5 questions.
 * This ensures zero wait time between questions during a study session.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type { Question } from "../types/questions";
import { generateMixedBatch } from "../services/openai";

/** Minimum queue size before triggering a background refill. */
const REFILL_THRESHOLD = 5;

/**
 * Hook for managing the question queue with automatic pre-generation.
 *
 * @returns Current question, loading state, error state, and navigation controls.
 */
export function useQuestionGenerator() {
  const [queue, setQueue] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Ref to prevent duplicate refill requests. */
  const isRefilling = useRef(false);

  /** Ref to track if initial load has been triggered. */
  const initialLoadDone = useRef(false);

  /**
   * Fetch a new batch of questions from the LLM and append to the queue.
   * Uses a ref guard to prevent concurrent refill requests.
   */
  const refillQueue = useCallback(async () => {
    if (isRefilling.current) return;
    isRefilling.current = true;

    try {
      const newQuestions = await generateMixedBatch();
      setQueue((prev) => [...prev, ...newQuestions]);
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to generate questions";
      setError(message);
      console.error("Question generation failed:", err);
    } finally {
      isRefilling.current = false;
      setIsLoading(false);
    }
  }, []);

  /** Initial load: fetch the first batch of questions on mount. */
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      refillQueue();
    }
  }, [refillQueue]);

  /**
   * Auto-refill: when remaining questions in the queue drops below threshold,
   * trigger a background batch generation.
   */
  useEffect(() => {
    const remaining = queue.length - currentIndex;
    if (remaining <= REFILL_THRESHOLD && remaining >= 0 && !isRefilling.current && queue.length > 0) {
      refillQueue();
    }
  }, [currentIndex, queue.length, refillQueue]);

  /** The question currently being displayed to the user. */
  const currentQuestion: Question | null = queue[currentIndex] ?? null;

  /**
   * Advance to the next question in the queue.
   * The auto-refill effect will handle fetching more if needed.
   */
  const nextQuestion = useCallback(() => {
    setCurrentIndex((prev) => prev + 1);
  }, []);

  /**
   * Retry loading after an error by clearing error state and refilling.
   */
  const retry = useCallback(() => {
    setError(null);
    setIsLoading(true);
    refillQueue();
  }, [refillQueue]);

  return {
    currentQuestion,
    isLoading: isLoading && !currentQuestion,
    error,
    nextQuestion,
    retry,
    queueSize: queue.length - currentIndex,
  };
}
