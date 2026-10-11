import { useState } from 'react';
import type { CountData } from '../content/schema';

interface Props {
  data: CountData;
  onCorrect: () => void;
  onMistake: () => void;
}

export function CountingGame({ data, onCorrect, onMistake }: Props) {
  const [wrongChoices, setWrongChoices] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);

  const handleChoice = (n: number) => {
    if (solved) return;
    if (n === data.answer) {
      setSolved(true);
      onCorrect();
    } else {
      setWrongChoices((prev) => [...prev, n]);
      onMistake();
    }
  };

  return (
    <div>
      <div className="objects-row" aria-label="物品">
        {data.objects.map((obj, groupIndex) => (
          <span key={groupIndex} className="object-group">
            {Array.from({ length: obj.count }, (_, i) => (
              <span key={i} className="object-emoji">
                {obj.emoji}
              </span>
            ))}
          </span>
        ))}
      </div>
      <div className="choices-row">
        {data.choices.map((n) => (
          <button
            key={n}
            className={`choice-button ${wrongChoices.includes(n) ? 'shake' : ''}`}
            onClick={() => handleChoice(n)}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}