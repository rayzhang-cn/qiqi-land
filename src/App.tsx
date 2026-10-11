import { useState } from 'react';
import { ProfileSelect } from './screens/ProfileSelect';
import { WorldMap } from './screens/WorldMap';
import { ChapterSelect } from './screens/ChapterSelect';
import { ChapterView } from './screens/ChapterView';
import { GameEngine } from './engine/GameEngine';
import { PoemList } from './screens/PoemList';
import { PoemRecital } from './screens/PoemRecital';
import { getLevel, getPoem } from './content';

type Screen =
  | { name: 'profiles' }
  | { name: 'map' }
  | { name: 'chapters'; island: string }
  | { name: 'chapter'; chapterId: string }
  | { name: 'game'; levelId: string }
  | { name: 'poem-list' }
  | { name: 'poem-recital'; poemId: string };

const MAP = { name: 'map' } as const;

export function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'profiles' });

  const openIsland = (domain: string) => {
    if (domain === 'math') setScreen({ name: 'chapters', island: 'math' });
    else if (domain === 'language') setScreen({ name: 'poem-list' });
  };

  switch (screen.name) {
    case 'profiles':
      return <ProfileSelect onEnter={() => setScreen(MAP)} />;
    case 'map':
      return <WorldMap onOpenIsland={openIsland} />;
    case 'chapters':
      return (
        <ChapterSelect
          island={screen.island}
          onSelectChapter={(chapterId) => setScreen({ name: 'chapter', chapterId })}
          onBack={() => setScreen(MAP)}
        />
      );
    case 'chapter':
      return (
        <ChapterView
          chapterId={screen.chapterId}
          onPlayLevel={(levelId) => setScreen({ name: 'game', levelId })}
          onBack={() => setScreen(MAP)}
        />
      );
    case 'game': {
      const level = getLevel(screen.levelId);
      if (!level) return <WorldMap onOpenIsland={openIsland} />;
      return (
        <GameEngine
          level={level}
          onExit={() => setScreen({ name: 'chapter', chapterId: level.chapter })}
        />
      );
    }
    case 'poem-list':
      return (
        <PoemList
          onSelectPoem={(poemId) => setScreen({ name: 'poem-recital', poemId })}
          onBack={() => setScreen(MAP)}
        />
      );
    case 'poem-recital': {
      const poem = getPoem(screen.poemId);
      if (!poem) {
        return (
          <PoemList
            onSelectPoem={(poemId) => setScreen({ name: 'poem-recital', poemId })}
            onBack={() => setScreen(MAP)}
          />
        );
      }
      return <PoemRecital poem={poem} onExit={() => setScreen({ name: 'poem-list' })} />;
    }
  }
}
