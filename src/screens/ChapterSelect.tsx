import chapters from '../content/chapters.json';
import { getChapterLevels } from '../content';
import { useProfilesStore } from '../stores/profiles';
import { ISLANDS } from '../islands';

interface Props {
  island: string;
  onSelectChapter: (chapterId: string) => void;
  onBack: () => void;
}

export function ChapterSelect({ island, onSelectChapter, onBack }: Props) {
  const ageBand = useProfilesStore(
    (s) => s.profiles.find((p) => p.id === s.activeId)?.ageBand ?? '3-4',
  );
  const islandName = ISLANDS.find((i) => i.domain === island)?.name ?? '';

  const islandChapters = chapters
    .filter((c) => c.island === island)
    .filter((c) => getChapterLevels(c.id).some((l) => l.ageBand === ageBand));

  return (
    <div className="chapter-select">
      <button className="back-button" onClick={onBack}>
        ← 返回地图
      </button>
      <h1 className="chapter-select-title">{islandName}</h1>
      <div className="chapter-list">
        {islandChapters.map((c) => (
          <button key={c.id} className="chapter-card" onClick={() => onSelectChapter(c.id)}>
            <span className="chapter-card-title">{c.title}</span>
            <span className="chapter-card-story">{c.story}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
