import { getPoems } from '../content';
import { useProfilesStore } from '../stores/profiles';
import { useProgressStore, type LevelProgress } from '../stores/progress';

const EMPTY: Record<string, LevelProgress> = {};

interface Props {
  onSelectPoem: (id: string) => void;
  onBack: () => void;
}

export function PoemList({ onSelectPoem, onBack }: Props) {
  const poems = [...getPoems()].sort((a, b) => Number(b.familiar) - Number(a.familiar));
  const activeId = useProfilesStore((s) => s.activeId);
  const progress = useProgressStore((s) => (activeId ? s.byProfile[activeId] ?? EMPTY : EMPTY));

  return (
    <div className="poem-list">
      <button className="back-button" onClick={onBack}>
        ← 返回地图
      </button>
      <h1 className="poem-list-title">诗词小径</h1>
      <p className="poem-list-story">跟着奇奇一起，听一首优美的古诗吧！</p>
      <div className="poem-card-list">
        {poems.map((p) => {
          const stars = progress[p.id]?.stars ?? 0;
          return (
            <button key={p.id} className="poem-card" onClick={() => onSelectPoem(p.id)}>
              <div className="poem-card-main">
                <span className="poem-card-title">{p.title}</span>
                <span className="poem-card-meta">
                  {p.author} · {p.dynasty}
                </span>
              </div>
              <div className="poem-card-right">
                <span className={`poem-badge ${p.familiar ? 'poem-badge-known' : 'poem-badge-new'}`}>
                  {p.familiar ? '已会' : '新学'}
                </span>
                {stars > 0 && (
                  <span className="poem-card-stars" aria-label="诗词星星">
                    {'⭐'.repeat(stars)}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
