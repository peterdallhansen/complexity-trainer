/**
 * Header component — displays the app title, current score, and streak.
 * Clean, minimal design with session statistics.
 */

import type { ScoreState } from "../../types/questions";
import "./Header.css";

interface HeaderProps {
  /** Current score state from the useScore hook. */
  score: ScoreState;
  /** Number of questions remaining in the pre-generated queue. */
  queueSize: number;
}

/**
 * Renders the app header with title and live score metrics.
 */
export default function Header({ score, queueSize }: HeaderProps) {
  const accuracy =
    score.totalAnswered > 0
      ? Math.round((score.correct / score.totalAnswered) * 100)
      : 0;

  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="app-title">Complexity Trainer</h1>
        <span className="header-subtitle">DTU Algoritmer Exam Practice</span>
      </div>

      <div className="header-right">
        <div className="stat-group">
          <div className="stat">
            <span className="stat-value correct-value">{score.correct}</span>
            <span className="stat-label">Correct</span>
          </div>
          <div className="stat">
            <span className="stat-value incorrect-value">{score.incorrect}</span>
            <span className="stat-label">Wrong</span>
          </div>
          <div className="stat">
            <span className="stat-value">{accuracy}%</span>
            <span className="stat-label">Accuracy</span>
          </div>
          <div className="stat">
            <span className={`stat-value streak-value ${score.streak >= 5 ? "on-fire" : ""}`}>
              {score.streak}
            </span>
            <span className="stat-label">Streak</span>
          </div>
        </div>

        <div className="queue-indicator" title={`${queueSize} questions queued`}>
          <div className="queue-dots">
            {Array.from({ length: Math.min(queueSize, 10) }).map((_, i) => (
              <span key={i} className="queue-dot" />
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
