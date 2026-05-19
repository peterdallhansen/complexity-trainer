/**
 * TrueFalseQuestion component — Type 2 question format.
 *
 * Displays a single asymptotic notation statement rendered in LaTeX.
 * The student marks whether the statement is correct (Yes) or incorrect (No).
 */

import { useState } from "react";
import MathExpression from "../MathExpression/MathExpression";
import ExplanationText from "../ExplanationText/ExplanationText";
import type { TrueFalseQuestion as TrueFalseQuestionType } from "../../types/questions";
import "./TrueFalseQuestion.css";

interface TrueFalseQuestionProps {
  /** The true/false question data from the LLM. */
  question: TrueFalseQuestionType;
  /** Callback when the user submits their answer. */
  onAnswer: (isCorrect: boolean) => void;
  /** Whether the answer has already been submitted for this question. */
  isAnswered: boolean;
}

/**
 * Renders a true/false asymptotic notation question.
 * Shows the LaTeX statement and two buttons (Yes / No).
 */
export default function TrueFalseQuestion({
  question,
  onAnswer,
  isAnswered,
}: TrueFalseQuestionProps) {
  const [selected, setSelected] = useState<boolean | null>(null);

  /** Handle selecting Yes or No. */
  const handleSelect = (value: boolean) => {
    if (isAnswered) return;
    setSelected(value);
  };

  /** Submit the selected answer. */
  const handleSubmit = () => {
    if (selected === null || isAnswered) return;
    onAnswer(selected === question.isCorrect);
  };

  /**
   * Determine the CSS class for a Yes/No button based on answer state.
   */
  const getButtonClass = (value: boolean): string => {
    const classes = ["tf-option"];

    if (isAnswered) {
      if (value === question.isCorrect) {
        classes.push("correct");
      } else if (value === selected) {
        classes.push("incorrect");
      }
    } else if (value === selected) {
      classes.push("selected");
    }

    return classes.join(" ");
  };

  return (
    <div className="trueFalse-question">
      <p className="question-prompt">
        Is the following statement correct?
      </p>

      <div className="statement-display">
        <MathExpression math={question.latex} block />
      </div>

      <div className="tf-options">
        <button
          className={getButtonClass(true)}
          onClick={() => handleSelect(true)}
          disabled={isAnswered}
        >
          Yes
        </button>
        <button
          className={getButtonClass(false)}
          onClick={() => handleSelect(false)}
          disabled={isAnswered}
        >
          No
        </button>
      </div>

      {!isAnswered && (
        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={selected === null}
        >
          Check Answer
        </button>
      )}

      {isAnswered && (
        <div className={`explanation ${selected === question.isCorrect ? "explanation-correct" : "explanation-incorrect"}`}>
          <div className="explanation-header">
            {selected === question.isCorrect ? (
              <span className="result-icon correct-icon">✓</span>
            ) : (
              <span className="result-icon incorrect-icon">✗</span>
            )}
            <span className="result-text">
              {selected === question.isCorrect
                ? "Correct!"
                : `Incorrect — the statement is ${question.isCorrect ? "TRUE" : "FALSE"}.`}
            </span>
          </div>
          <p className="explanation-text"><ExplanationText text={question.explanation} /></p>
        </div>
      )}
    </div>
  );
}
