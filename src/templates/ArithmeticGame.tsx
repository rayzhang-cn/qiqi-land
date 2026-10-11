import { useState } from 'react';
import type { ArithmeticData } from '../content/schema';
import { generateProblem, generateChoices, type Problem } from './arithmetic';

interface Props {
  data: ArithmeticData;
  mode: 'choice' | 'fill';
  onCorrect: () => void;
  onMistake: () => void;
}

interface Round {
  problem: Problem;
  choices: number[];
}

export function ArithmeticGame({ data, mode, onCorrect, onMistake }: Props) {
  const [rounds] = useState<Round[]>(() =>
    Array.from({ length: data.problemCount }, () => {
      const problem = generateProblem(data);
      return { problem, choices: mode === 'choice' ? generateChoices(problem.answer, data.maxResult) : [] };
    }),
  );
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [wrong, setWrong] = useState(false);

  const round = rounds[index];

  const handleCorrect = () => {
    if (index >= rounds.length - 1) {
      onCorrect();
    } else {
      setIndex(index + 1);
      setInput('');
      setWrong(false);
    }
  };

  const handleMistake = () => {
    setWrong(true);
    onMistake();
  };

  const pressDigit = (d: number) => {
    setWrong(false);
    setInput((prev) => (prev.length < 2 ? prev + d : prev));
  };
  const pressBackspace = () => setInput((prev) => prev.slice(0, -1));
  const pressConfirm = () => {
    if (input === '') return;
    if (parseInt(input, 10) === round.problem.answer) handleCorrect();
    else handleMistake();
  };

  return (
    <div className="arithmetic">
      <div className="arith-progress">
        第 {index + 1} / {rounds.length} 题
      </div>
      <div className="arith-question">{round.problem.text} = ?</div>
      {mode === 'choice' ? (
        <div className="choices-row">
          {round.choices.map((n) => (
            <button key={n} className="choice-button" onClick={() => (n === round.problem.answer ? handleCorrect() : handleMistake())}>
              {n}
            </button>
          ))}
        </div>
      ) : (
        <div className="fill-panel">
          <div className="fill-input" aria-label="答案">
            {input === '' ? '?' : input}
          </div>
          <div className="num-pad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
              <button key={d} className="num-key" onClick={() => pressDigit(d)}>
                {d}
              </button>
            ))}
            <button className="num-key" onClick={pressBackspace} aria-label="退格">
              ⌫
            </button>
            <button className="num-key" onClick={() => pressDigit(0)}>
              0
            </button>
            <button className="num-key num-confirm" onClick={pressConfirm} aria-label="确认">
              ✓
            </button>
          </div>
        </div>
      )}
      {wrong && <div className="arith-wrong">再试一次哦</div>}
    </div>
  );
}
