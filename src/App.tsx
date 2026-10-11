import { useState } from 'react';
import { ProfileSelect } from './screens/ProfileSelect';
import { WorldMap } from './screens/WorldMap';
import { ChapterView } from './screens/ChapterView';
import { GameEngine } from './engine/GameEngine';
import { getLevel } from './content';

type Screen =
  | { name: 'profiles' }
  | { name: 'map' }
  | { name: 'chapter'; chapterId: string }
  | { name: 'game'; levelId: string };

const MAP = { name: 'map' } as const;

export function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'profiles' });

  switch (screen.name) {
    case 'profiles':
      return <ProfileSelect onEnter={() => setScreen(MAP)} />;
    case 'map':
      return <WorldMap onOpenIsland={() => setScreen({ name: 'chapter', chapterId: 'math-ch1' })} />;
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
      if (!level) return <WorldMap onOpenIsland={() => setScreen({ name: 'chapter', chapterId: 'math-ch1' })} />;
      return (
        <GameEngine
          level={level}
          onExit={() => setScreen({ name: 'chapter', chapterId: level.chapter })}
        />
      );
    }
  }
}