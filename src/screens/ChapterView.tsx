import chapters from '../content/chapters.json';
import { getChapterLevels } from '../content';
import { isLevelUnlocked } from '../engine/unlock';
import { useProfilesStore } from '../stores/profiles';
import { useProgressStore, type LevelProgress } from '../stores/progress';

const EMPTY: Record<string, LevelProgress> = {};

interface Props {
  chapterId: string;
  onPlayLevel: (levelId: string) => void;
  onBack: () => void;
}

export function ChapterView({ chapterId, onPlayLevel, onBack }: Props) {
  const chapter = chapters.find((c) => c.id === chapterId);
  const ageBand = useProfilesStore(
    (s) => s.profiles.find((p) => p.id === s.activeId)?.ageBand ?? '3-4',
  );
  const activeId = useProfilesStore((s) => s.activeId);
  const levelProgress = useProgressStore((s) =>
    activeId ? s.byProfile[activeId] ?? EMPTY : EMPTY,
  );

  const chapterLevels = getChapterLevels(chapterId).filter((l) => l.ageBand === ageBand);

  if (!chapter) return null;

  return (
    <div className="chapter-view">
      <button className="back-button" onClick={onBack}>
        ← 返回地图
      </button>
      <h1>{chapter.title}</h1>
      <p className="chapter-story">{chapter.story}</p>
      <div className="level-list">
        {chapterLevels.map((level, index) => {
          const unlocked = isLevelUnlocked(chapterLevels, index, levelProgress);
          const stars = levelProgress[level.id]?.stars ?? 0;
          return (
            <button
              key={level.id}
              className="level-button"
              disabled={!unlocked}
              onClick={() => onPlayLevel(level.id)}
            >
              {unlocked ? `第 ${index + 1} 关` : '🔒'}
              {stars > 0 && <span aria-label="关卡星星">{'⭐'.repeat(stars)}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}