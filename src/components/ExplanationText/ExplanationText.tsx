/**
 * ExplanationText component — renders explanation text with inline LaTeX.
 *
 * Parses text containing LaTeX delimiters \(...\) and renders them
 * using KaTeX, while keeping surrounding text as plain spans.
 */

import { memo } from "react";
import MathExpression from "../MathExpression/MathExpression";

interface ExplanationTextProps {
  /** Raw text that may contain \(...\) LaTeX delimiters. */
  text: string;
}

/**
 * Splits text on \(...\) boundaries and renders LaTeX segments via KaTeX.
 * Non-LaTeX segments are rendered as plain text spans.
 */
const ExplanationText = memo(function ExplanationText({ text }: ExplanationTextProps) {
  // Match \( ... \) patterns for inline LaTeX
  const parts = text.split(/(\\\(.*?\\\))/g);

  return (
    <span>
      {parts.map((part, i) => {
        // Check if this part is a LaTeX expression
        const match = part.match(/^\\\((.*?)\\\)$/);
        if (match) {
          return <MathExpression key={i} math={match[1]} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
});

export default ExplanationText;
