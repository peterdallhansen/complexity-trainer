/**
 * MathExpression component — renders LaTeX math expressions using KaTeX.
 *
 * Supports both inline and block (display) modes. Uses useRef + useEffect
 * for direct KaTeX rendering to avoid unnecessary re-renders.
 */

import { useEffect, useRef, memo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import "./MathExpression.css";

interface MathExpressionProps {
  /** LaTeX math expression string (e.g., "O(n \\log n)") */
  math: string;
  /** Whether to render in display mode (centered, larger) vs inline */
  block?: boolean;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Renders a LaTeX math expression using KaTeX.
 * Memoized to prevent re-renders when the expression hasn't changed.
 */
const MathExpression = memo(function MathExpression({
  math,
  block = false,
  className = "",
}: MathExpressionProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(math, containerRef.current, {
          displayMode: block,
          throwOnError: false,
          trust: true,
          strict: false,
        });
      } catch (err) {
        console.error("KaTeX render error:", err);
        if (containerRef.current) {
          containerRef.current.textContent = math;
        }
      }
    }
  }, [math, block]);

  return (
    <span
      ref={containerRef}
      className={`math-expression ${block ? "math-block" : "math-inline"} ${className}`}
    />
  );
});

export default MathExpression;
