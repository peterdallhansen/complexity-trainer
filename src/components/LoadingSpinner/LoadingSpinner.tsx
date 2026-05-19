/**
 * LoadingSpinner component — displayed while questions are being generated.
 * Shows a shimmer animation with a status message.
 */

import "./LoadingSpinner.css";

interface LoadingSpinnerProps {
  /** Optional message to display below the spinner. */
  message?: string;
}

export default function LoadingSpinner({
  message = "Generating questions...",
}: LoadingSpinnerProps) {
  return (
    <div className="loading-container">
      <div className="spinner-ring">
        <div className="spinner-inner" />
      </div>
      <p className="loading-message">{message}</p>
      <div className="shimmer-bars">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="shimmer-bar" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}
