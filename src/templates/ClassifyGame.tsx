import { useState } from 'react';
import type { ClassifyData } from '../content/schema';

interface Props {
  data: ClassifyData;
  onCorrect: () => void;
  onMistake: () => void;
}

export function ClassifyGame({ data, onCorrect, onMistake }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Record<string, boolean>>({});
  const [wrong, setWrong] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);

  const remaining = data.items.filter((it) => !placed[it.id]);

  const handleSelect = (itemId: string) => {
    if (solved) return;
    setSelected(itemId);
    setWrong(null);
  };

  const handleBucket = (bucketId: string) => {
    if (solved || !selected) return;
    const item = data.items.find((it) => it.id === selected);
    if (!item) return;
    if (item.bucketId === bucketId) {
      setPlaced((p) => ({ ...p, [item.id]: true }));
      setSelected(null);
      setWrong(null);
      if (remaining.length === 1) {
        setSolved(true);
        onCorrect();
      }
    } else {
      setWrong(selected);
      onMistake();
    }
  };

  return (
    <div className="classify">
      <div className="classify-buckets">
        {data.buckets.map((b) => (
          <button key={b.id} className="classify-bucket" onClick={() => handleBucket(b.id)} aria-label={b.label}>
            <span className="classify-bucket-emoji">{b.emoji}</span>
            <span>{b.label}</span>
          </button>
        ))}
      </div>
      <div className="classify-items">
        {data.items.map((it) =>
          placed[it.id] ? (
            <div key={it.id} className="classify-item classify-item-placed" />
          ) : (
            <button
              key={it.id}
              className={`classify-item ${selected === it.id ? 'classify-item-selected' : ''} ${wrong === it.id ? 'shake' : ''}`}
              onClick={() => handleSelect(it.id)}
              aria-label={it.label}
            >
              <span className="classify-item-emoji">{it.emoji}</span>
            </button>
          ),
        )}
      </div>
    </div>
  );
}
