import { useState } from 'react';
import type { LevelData } from '../content/schema';
import { useSpeech } from './useSpeech';
import { useProfilesStore } from '../stores/profiles';
import { useProgressStore } from '../stores/progress';
import { TapToIdentify } from '../templates/TapToIdentify';
import { CountingGame } from '../templates/CountingGame';
import { ArithmeticGame } from '../templates/ArithmeticGame';
import { ClassifyGame } from '../templates/ClassifyGame';
import { ColoringGame } from '../templates/ColoringGame';
import { MusicGame } from '../templates/MusicGame';
import { Buddy } from '../components/Buddy';

const ENCOURAGEMENTS = ['没关系，再试一次！', '加油，你可以的！', '仔细想想，马上就想到了！'];

export function GameEngine({ level, onExit }: { level: LevelData; onExit: () => void }) {
  const { speak } = useSpeech();
  const [phase, setPhase] = useState<'playing' | 'reward'>('playing');
  const activeId = useProfilesStore((s) => s.activeId);
  const avatar = useProfilesStore((s) => s.profiles.find((p) => p.id === s.activeId)?.avatar ?? '🦖');
  const recordAttempt = useProgressStore((s) => s.recordAttempt);

  const speakPrompt = () => {
    speak(level.storyLine ? `${level.storyLine}，${level.voicePrompt}` : level.voicePrompt);
  };

  const handleCorrect = () => {
    if (activeId) recordAttempt(activeId, level.id, true, level.reward.stars);
    speak('太棒了！');
    setPhase('reward');
  };

  const handleMistake = () => {
    if (activeId) recordAttempt(activeId, level.id, false, 0);
    speak(ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]);
  };

  const renderTemplate = () => {
    switch (level.template) {
      case 'tap-identify':
        return <TapToIdentify data={level.data} onCorrect={handleCorrect} onMistake={handleMistake} />;
      case 'count':
        return <CountingGame data={level.data} onCorrect={handleCorrect} onMistake={handleMistake} />;
      case 'arithmetic':
        return <ArithmeticGame data={level.data} mode={level.mode} onCorrect={handleCorrect} onMistake={handleMistake} />;
      case 'classify':
        return <ClassifyGame data={level.data} onCorrect={handleCorrect} onMistake={handleMistake} />;
      case 'coloring':
        return <ColoringGame data={level.data} onCorrect={handleCorrect} />;
      case 'music':
        return <MusicGame data={level.data} onCorrect={handleCorrect} onMistake={handleMistake} />;
    }
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
      <button className="listen-button" onClick={speakPrompt} aria-label="听一听">
        🔊 听一听
      </button>
      {renderTemplate()}
    </div>
  );
}