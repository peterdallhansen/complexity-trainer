/**
 * AlgorithmQuestion component — Type 1 question format.
 *
 * Displays a single pseudocode algorithm and a grid of Big-O complexity
 * options. The student selects the tightest bound, then checks their answer.
 */

import { useState } from "react";
import PseudoCode from "../PseudoCode/PseudoCode";
import MathExpression from "../MathExpression/MathExpression";
import ExplanationText from "../ExplanationText/ExplanationText";
import type { AlgorithmQuestion as AlgorithmQuestionType, ComplexityOption } from "../../types/questions";
import { COMPLEXITY_OPTIONS } from "../../types/questions";
import "./AlgorithmQuestion.css";

interface AlgorithmQuestionProps {
  /** The algorithm question data from the LLM. */
  question: AlgorithmQuestionType;
  /** Callback when the user submits their answer. */
  onAnswer: (isCorrect: boolean) => void;
  /** Whether the answer has already been submitted for this question. */
  isAnswered: boolean;
}

/**
 * Renders an algorithm complexity analysis question.
 * Shows pseudocode on the left/top and a complexity option grid below.
 */
export default function AlgorithmQuestion({
  question,
  onAnswer,
  isAnswered,
}: AlgorithmQuestionProps) {
  const [selected, setSelected] = useState<ComplexityOption | null>(null);

  /** Handle selecting a complexity option. */
  const handleSelect = (option: ComplexityOption) => {
    if (isAnswered) return;
    setSelected(option);
  };

  /** Submit the selected answer and check correctness. */
  const handleSubmit = () => {
    if (!selected || isAnswered) return;
    onAnswer(selected === question.correctAnswer);
  };

  /**
   * Determine the CSS class for an option based on answer state.
   * - Before answering: highlight if selected
   * - After answering: green for correct, red for incorrect selection
   */
  const getOptionClass = (option: ComplexityOption): string => {
    const classes = ["complexity-option"];

    if (isAnswered) {
      if (option === question.correctAnswer) {
        classes.push("correct");
      } else if (option === selected) {
        classes.push("incorrect");
      }
    } else if (option === selected) {
      classes.push("selected");
    }

    return classes.join(" ");
  };

  return (
    <div className="algorithm-question">
      <p className="question-prompt">
        Mark the running time in O-notation. Select the tightest bound.
      </p>

      <div className="algorithm-display">
        <PseudoCode
          lines={question.pseudocode}
          name={`${question.name}(${question.parameter})`}
        />
      </div>

      <div className="complexity-grid">
        {COMPLEXITY_OPTIONS.map((option) => (
          <button
            key={option}
            className={getOptionClass(option)}
            onClick={() => handleSelect(option)}
            disabled={isAnswered}
            aria-label={`Select ${option}`}
          >
            <MathExpression math={option} />
          </button>
        ))}
      </div>

      {!isAnswered && (
        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={!selected}
        >
          Check Answer
        </button>
      )}

      {isAnswered && (
        <div className={`explanation ${selected === question.correctAnswer ? "explanation-correct" : "explanation-incorrect"}`}>
          <div className="explanation-header">
            {selected === question.correctAnswer ? (
              <span className="result-icon correct-icon">✓</span>
            ) : (
              <span className="result-icon incorrect-icon">✗</span>
            )}
            <span className="result-text">
              {selected === question.correctAnswer
                ? "Correct!"
                : <>Incorrect — the answer is <MathExpression math={question.correctAnswer} /></>}
            </span>
          </div>
          <p className="explanation-text"><ExplanationText text={question.explanation} /></p>
        </div>
      )}
    </div>
  );
}
