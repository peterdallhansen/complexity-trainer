import { useState } from "react";
import "./SetupScreen.css";

interface SetupScreenProps {
  onStart: (selectedTypes: string[]) => void;
}

export default function SetupScreen({ onStart }: SetupScreenProps) {
  const [types, setTypes] = useState({
    algorithm: true,
    trueFalse: true,
  });

  const handleToggle = (type: "algorithm" | "trueFalse") => {
    setTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleStart = () => {
    const selectedTypes = Object.entries(types)
      .filter(([_, isSelected]) => isSelected)
      .map(([type]) => type);
    onStart(selectedTypes);
  };

  const hasSelection = types.algorithm || types.trueFalse;

  return (
    <div className="setup-screen">
      <h2 className="setup-title">Customize Your Practice</h2>
      <p className="setup-subtitle">
        Select the types of questions you want to focus on for your DTU Algoritmer exam preparation.
      </p>

      <div className="setup-options">
        <label className={`setup-option ${types.algorithm ? "selected" : ""}`}>
          <div className="option-checkbox">
            {types.algorithm && <span className="checkmark">✓</span>}
          </div>
          <div className="option-content">
            <h3>Algorithm Analysis</h3>
            <p>Determine the tightest Big-O bound for pseudocode snippets.</p>
          </div>
          <input
            type="checkbox"
            checked={types.algorithm}
            onChange={() => handleToggle("algorithm")}
            className="hidden-checkbox"
          />
        </label>

        <label className={`setup-option ${types.trueFalse ? "selected" : ""}`}>
          <div className="option-checkbox">
            {types.trueFalse && <span className="checkmark">✓</span>}
          </div>
          <div className="option-content">
            <h3>Asymptotic Notation</h3>
            <p>True/False questions evaluating mathematical statements.</p>
          </div>
          <input
            type="checkbox"
            checked={types.trueFalse}
            onChange={() => handleToggle("trueFalse")}
            className="hidden-checkbox"
          />
        </label>
      </div>

      <button
        className="start-practice-btn"
        onClick={handleStart}
        disabled={!hasSelection}
      >
        Start Practice
      </button>
    </div>
  );
}
