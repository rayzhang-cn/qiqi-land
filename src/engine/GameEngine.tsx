import { useEffect, useState } from 'react';
import type { LevelData } from '../content/schema';
import { useSpeech } from './useSpeech';
import { useProfilesStore } from '../stores/profiles';
import { useProgressStore } from '../stores/progress';
import { TapToIdentify } from '../templates/TapToIdentify';
import { CountingGame } from '../templates/CountingGame';
import { Buddy } from '../components/Buddy';

const ENCOURAGEMENTS = ['没关系，再试一次！', '加油，你可以的！', '仔细想想，马上就想到了！'];

export function GameEngine({ level, onExit }: { level: LevelData; onExit: () => void }) {
  const { speak } = useSpeech();
  const [phase, setPhase] = useState<'playing' | 'reward'>('playing');
  const activeId = useProfilesStore((s) => s.activeId);
  const avatar = useProfilesStore((s) => s.profiles.find((p) => p.id === s.activeId)?.avatar ?? '🦖');
  const recordAttempt = useProgressStore((s) => s.recordAttempt);

  useEffect(() => {
    speak(level.storyLine ? `${level.storyLine}，${level.voicePrompt}` : level.voicePrompt);
  }, [level.id, level.storyLine, level.voicePrompt, speak]);

  const handleCorrect = () => {
    if (activeId) recordAttempt(activeId, level.id, true, level.reward.stars);
    speak('太棒了！');
    setPhase('reward');
  };

  const handleMistake = () => {
    if (activeId) recordAttempt(activeId, level.id, false, 0);
    speak(ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]);
  };

  if (phase === 'reward') {
    return (
      <div className="reward-view">
        <div className="reward-stars" aria-label="获得星星">
          {'⭐'.repeat(level.reward.stars)}
        </div>
        <Buddy avatar={avatar} text="太棒了！" />
        <button className="big-button" onClick={onExit}>
          继续
        </button>
      </div>
    );
  }

  return (
    <div className="game-screen">
      <Buddy avatar={avatar} text={level.storyLine ?? ''} />
      <p className="voice-prompt">{level.voicePrompt}</p>
      {level.template === 'tap-identify' ? (
        <TapToIdentify data={level.data} onCorrect={handleCorrect} onMistake={handleMistake} />
      ) : (
        <CountingGame data={level.data} onCorrect={handleCorrect} onMistake={handleMistake} />
      )}
    </div>
  );
}