/**
 * Complexity Trainer — Main Application Component
 *
 * Orchestrates the question flow: displays one question at a time from a
 * pre-generated queue, handles answer checking, and provides smooth
 * transitions between questions. Questions auto-refill in the background.
 */

import { useState, useCallback } from "react";
import Header from "./components/Header/Header";
import AlgorithmQuestion from "./components/AlgorithmQuestion/AlgorithmQuestion";
import TrueFalseQuestion from "./components/TrueFalseQuestion/TrueFalseQuestion";
import LoadingSpinner from "./components/LoadingSpinner/LoadingSpinner";
import SetupScreen from "./components/SetupScreen/SetupScreen";
import { useQuestionGenerator } from "./hooks/useQuestionGenerator";
import { useScore } from "./hooks/useScore";
import "./App.css";

/**
 * Root application component.
 * Manages the state machine: loading → question → answered → next question.
 */
function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const { currentQuestion, isLoading, error, nextQuestion, retry, queueSize } =
    useQuestionGenerator(isStarted, selectedTypes);
  const { score, recordAnswer } = useScore();
  const [isAnswered, setIsAnswered] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);

  const handleStartSession = useCallback((types: string[]) => {
    setSelectedTypes(types);
    setIsStarted(true);
  }, []);

  /**
   * Handle answer submission from either question type.
   * Records the result and transitions to the "answered" state.
   */
  const handleAnswer = useCallback(
    (isCorrect: boolean) => {
      recordAnswer(isCorrect);
      setIsAnswered(true);
    },
    [recordAnswer]
  );

  /**
   * Advance to the next question and reset answer state.
   * Increments questionIndex to force a remount of the question component.
   */
  const handleNext = useCallback(() => {
    setIsAnswered(false);
    setQuestionIndex((prev) => prev + 1);
    nextQuestion();
  }, [nextQuestion]);

  /**
   * Handle keyboard shortcut: Enter or Space to advance.
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isAnswered && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        handleNext();
      }
    },
    [isAnswered, handleNext]
  );

  return (
    <div className="app" onKeyDown={handleKeyDown} tabIndex={0}>
      <Header score={score} queueSize={queueSize} />

      <main className="main-content">
        {!isStarted ? (
          <SetupScreen onStart={handleStartSession} />
        ) : (
          <>
            {/* Loading state */}
        {isLoading && !error && <LoadingSpinner />}

        {/* Error state */}
        {error && (
          <div className="error-container">
            <div className="error-icon">!</div>
            <h2 className="error-title">Generation Failed</h2>
            <p className="error-message">{error}</p>
            <button className="retry-btn" onClick={retry}>
              Try Again
            </button>
          </div>
        )}

        {/* Question display */}
        {currentQuestion && !isLoading && !error && (
          <div className="question-wrapper" key={`q-${questionIndex}`}>
            <div className="question-counter">
              Question #{score.totalAnswered + (isAnswered ? 0 : 1)}
            </div>

            <div className="question-type-badge">
              {currentQuestion.type === "algorithm"
                ? "Algorithm Analysis"
                : "Asymptotic Notation"}
            </div>

            <div className="question-card">
              {currentQuestion.type === "algorithm" ? (
                <AlgorithmQuestion
                  question={currentQuestion}
                  onAnswer={handleAnswer}
                  isAnswered={isAnswered}
                />
              ) : (
                <TrueFalseQuestion
                  question={currentQuestion}
                  onAnswer={handleAnswer}
                  isAnswered={isAnswered}
                />
              )}
            </div>

            {isAnswered && (
              <button className="next-btn" onClick={handleNext} autoFocus>
                Next Question
                <span className="next-arrow">→</span>
              </button>
            )}
          </div>
        )}
          </>
        )}
      </main>

      <footer className="app-footer">
        <span>Complexity Trainer — Built for DTU 02110 Algoritmer</span>
      </footer>
    </div>
  );
}

export default App;
