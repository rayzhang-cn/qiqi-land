import { useProfilesStore } from '../stores/profiles';
import { useProgressStore } from '../stores/progress';

const ISLANDS = [
  { domain: 'math', emoji: '🔢', name: '数学山', open: true },
  { domain: 'language', emoji: '🔤', name: '语言岛', open: true },
  { domain: 'science', emoji: '🦕', name: '科学森林', open: false },
  { domain: 'art', emoji: '🎨', name: '艺术城堡', open: false },
] as const;

export function WorldMap({ onOpenIsland }: { onOpenIsland: (domain: string) => void }) {
  const profile = useProfilesStore((s) => s.profiles.find((p) => p.id === s.activeId));
  const activeId = useProfilesStore((s) => s.activeId);
  const totalStars = useProgressStore((s) => {
    const p = activeId ? s.byProfile[activeId] : undefined;
    return p ? Object.values(p).reduce((sum, l) => sum + l.stars, 0) : 0;
  });

  return (
    <div className="world-map">
      <header className="map-header">
        <span className="profile-avatar">{profile?.avatar}</span>
        <span>{profile?.name}</span>
        <span aria-label="总星星">⭐{totalStars}</span>
      </header>
      <h1 className="app-title">奇奇乐园</h1>
      <div className="island-grid">
        {ISLANDS.map((island) => (
          <button
            key={island.domain}
            className={`island-card ${island.open ? '' : 'island-locked'}`}
            disabled={!island.open}
            onClick={() => island.open && onOpenIsland(island.domain)}
          >
            <span className="island-emoji">{island.emoji}</span>
            <span>{island.name}</span>
            {!island.open && <span className="island-soon">即将开放</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
