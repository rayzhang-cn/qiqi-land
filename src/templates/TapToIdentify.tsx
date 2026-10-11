import { useState } from 'react';
import type { TapIdentifyData } from '../content/schema';

interface Props {
  data: TapIdentifyData;
  onCorrect: () => void;
  onMistake: () => void;
}

export function TapToIdentify({ data, onCorrect, onMistake }: Props) {
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);

  const handleTap = (cardId: string) => {
    if (solved) return;
    if (cardId === data.answerCardId) {
      setSolved(true);
      onCorrect();
    } else {
      setWrongIds((prev) => [...prev, cardId]);
      onMistake();
    }
  };

  return (
    <div className="card-grid">
      {data.cards.map((card) => (
        <button
          key={card.id}
          aria-label={card.label}
          className={[
            'game-card',
            wrongIds.includes(card.id) ? 'shake' : '',
            solved && card.id === data.answerCardId ? 'glow' : '',
          ].join(' ')}
          onClick={() => handleTap(card.id)}
        >
          <span className="card-emoji">{card.emoji}</span>
        </button>
      ))}
    </div>
  );
}