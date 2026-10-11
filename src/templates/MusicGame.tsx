import { useCallback, useEffect, useRef, useState } from 'react';
import type { MusicData } from '../content/schema';
import { playTone, resumeAudio } from './audio';

type Phase = 'idle' | 'playing' | 'listening';

interface Props {
  data: MusicData;
  onCorrect: () => void;
  onMistake: () => void;
}

export function MusicGame({ data, onCorrect, onMistake }: Props) {
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [sequence, setSequence] = useState<number[]>([]);
  const [inputIndex, setInputIndex] = useState(0);
  const [activeNote, setActiveNote] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const timersRef = useRef<number[]>([]);

  const startRound = useCallback(
    (r: number) => {
      const seq = Array.from({ length: data.startLength + r }, () =>
        Math.floor(Math.random() * data.notes.length),
      );
      setSequence(seq);
      setInputIndex(0);
      setPhase('playing');
      seq.forEach((noteIdx, i) => {
        const t = window.setTimeout(() => {
          setActiveNote(noteIdx);
          playTone(data.notes[noteIdx].tone, 400);
          const clearT = window.setTimeout(() => setActiveNote(null), 350);
          timersRef.current.push(clearT);
        }, i * 600 + 300);
        timersRef.current.push(t);
      });
      const endT = window.setTimeout(() => setPhase('listening'), seq.length * 600 + 400);
      timersRef.current.push(endT);
    },
    [data],
  );

  const start = () => {
    resumeAudio();
    setRound(0);
    setDone(false);
    startRound(0);
  };

  const handleTapNote = (noteIdx: number) => {
    if (done || phase !== 'listening') return;
    playTone(data.notes[noteIdx].tone, 400);
    if (noteIdx === sequence[inputIndex]) {
      const next = inputIndex + 1;
      if (next >= sequence.length) {
        if (round + 1 >= data.rounds) {
          setDone(true);
          onCorrect();
        } else {
          const nr = round + 1;
          setRound(nr);
          startRound(nr);
        }
      } else {
        setInputIndex(next);
      }
    } else {
      setInputIndex(0);
      onMistake();
      startRound(round);
    }
  };

  useEffect(() => () => timersRef.current.forEach((t) => window.clearTimeout(t)), []);

  return (
    <div className="music">
      <div className="music-status">
        {phase === 'idle' && (
          <button className="big-button" onClick={start} aria-label="开始">
            ▶️ 开始
          </button>
        )}
        {phase === 'playing' && <div className="music-listening">听一听…</div>}
        {phase === 'listening' && (
          <div className="music-listening">
            该你啦！第 {round + 1} / {data.rounds} 轮
          </div>
        )}
      </div>
      <div className="music-keys">
        {data.notes.map((n, idx) => (
          <button
            key={n.id}
            className={`music-key ${activeNote === idx ? 'music-key-active' : ''}`}
            onClick={() => handleTapNote(idx)}
            aria-label={n.id}
            disabled={phase !== 'listening'}
          >
            <span className="music-key-emoji">{n.emoji}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
