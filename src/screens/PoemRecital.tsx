import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Poem } from '../content/schema';
import { toChars } from '../templates/poemText';
import { useSpeech } from '../engine/useSpeech';
import { useProfilesStore } from '../stores/profiles';
import { useProgressStore } from '../stores/progress';
import { Buddy } from '../components/Buddy';

export const MS_PER_CHAR = 350;

type Status = 'idle' | 'playing' | 'done';

interface CharItem {
  lineIndex: number;
  charIndex: number;
}

export function PoemRecital({ poem, onExit }: { poem: Poem; onExit: () => void }) {
  const { speak, cancel } = useSpeech();
  const activeId = useProfilesStore((s) => s.activeId);
  const avatar = useProfilesStore((s) => s.profiles.find((p) => p.id === s.activeId)?.avatar ?? '🦖');
  const recordAttempt = useProgressStore((s) => s.recordAttempt);

  const reciteLines = useMemo(() => [poem.title, `${poem.author}，${poem.dynasty}`, ...poem.lines], [poem]);

  const items = useMemo<CharItem[]>(
    () => reciteLines.flatMap((line, lineIndex) => toChars(line).map((_, charIndex) => ({ lineIndex, charIndex }))),
    [reciteLines],
  );

  const [status, setStatus] = useState<Status>('idle');
  const [pos, setPos] = useState(-1);
  const timerRef = useRef<number | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    stopTimer();
    setPos(0);
    setStatus('playing');
    timerRef.current = window.setInterval(() => {
      setPos((prev) => prev + 1);
    }, MS_PER_CHAR);
  }, [stopTimer]);

  const stop = useCallback(() => {
    stopTimer();
    cancel();
    setStatus('idle');
    setPos(-1);
  }, [stopTimer, cancel]);

  useEffect(() => {
    if (status !== 'playing') return;
    if (pos >= items.length) {
      stopTimer();
      setStatus('done');
      if (activeId) recordAttempt(activeId, poem.id, true, 1);
      return;
    }
    if (pos === 0) {
      speak(reciteLines[items[0].lineIndex]);
    } else if (items[pos].lineIndex !== items[pos - 1].lineIndex) {
      speak(reciteLines[items[pos].lineIndex]);
    }
  }, [pos, status, items, reciteLines, speak, stopTimer, activeId, recordAttempt]);

  useEffect(() => () => stopTimer(), [stopTimer]);

  if (status === 'done') {
    return (
      <div className="reward-view">
        <div className="reward-stars" aria-label="获得星星">
          ⭐
        </div>
        <Buddy avatar={avatar} text="背得真好！" />
        <button className="big-button" onClick={onExit}>
          继续
        </button>
      </div>
    );
  }

  const current = pos >= 0 && pos < items.length ? items[pos] : null;

  return (
    <div className="poem-screen">
      <div className="poem-title">
        <h2 className={current?.lineIndex === 0 ? 'poem-heading-reading' : ''}>{poem.title}</h2>
        <span className={`poem-author ${current?.lineIndex === 1 ? 'poem-author-reading' : ''}`}>
          {poem.author} · {poem.dynasty}
        </span>
      </div>
      <div className="poem-lines">
        {poem.lines.map((line, li) => (
          <div key={li} className="poem-line">
            {toChars(line).map((ch, ci) => (
              <span
                key={ci}
                className={current?.lineIndex === li + 2 && current?.charIndex === ci ? 'char char-current' : 'char'}
              >
                {ch}
              </span>
            ))}
          </div>
        ))}
      </div>
      <div className="poem-controls">
        {status === 'idle' && (
          <button className="poem-play" onClick={start} aria-label="开始听">
            ▶️ 开始听
          </button>
        )}
        {status === 'playing' && (
          <button className="poem-stop" onClick={stop} aria-label="停止">
            ⏹ 停止
          </button>
        )}
      </div>
    </div>
  );
}
