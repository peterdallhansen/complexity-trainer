/**
 * PseudoCode component — renders formatted pseudocode blocks.
 *
 * Applies syntax highlighting for keywords (for, while, if, else, return, do, end, then)
 * and formats the code in a styled code-editor-like container with line numbers.
 */

import { memo } from "react";
import type { ReactNode } from "react";
import "./PseudoCode.css";

interface PseudoCodeProps {
  /** Lines of pseudocode to display */
  lines: string[];
  /** Algorithm name displayed as a header (e.g., "ALG1(n)") */
  name?: string;
}

/** Keywords to highlight in the pseudocode. */
const KEYWORDS = [
  "for",
  "while",
  "do",
  "end",
  "if",
  "then",
  "else",
  "return",
  "to",
];

/**
 * Highlight keywords in a line of pseudocode.
 * Wraps recognized keywords in <span> elements for CSS styling.
 */
function highlightLine(line: string): ReactNode[] {
  const parts: ReactNode[] = [];
  // Split on word boundaries to isolate keywords
  const tokens = line.split(/(\b\w+\b)/g);

  tokens.forEach((token, i) => {
    if (KEYWORDS.includes(token.toLowerCase())) {
      parts.push(
        <span key={i} className="pseudo-keyword">
          {token}
        </span>
      );
    } else {
      parts.push(<span key={i}>{token}</span>);
    }
  });

  return parts;
}

/**
 * Renders a pseudocode block with syntax highlighting and line numbers.
 * The first line (function signature) is rendered as a header.
 */
const PseudoCode = memo(function PseudoCode({ lines, name }: PseudoCodeProps) {
  // First line is typically the function signature
  const displayLines = name ? lines.slice(1) : lines;
  const header = name || lines[0];

  return (
    <div className="pseudocode-container">
      {header && <div className="pseudocode-header">{header}</div>}
      <div className="pseudocode-body">
        {displayLines.map((line, index) => (
          <div key={index} className="pseudocode-line">
            <span className="line-number">{index + 1}</span>
            <span className="line-content">{highlightLine(line)}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

export default PseudoCode;
