import { useRef, useState } from 'react';
import type { ColoringData } from '../content/schema';

interface Props {
  data: ColoringData;
  onCorrect: () => void;
}

interface Segment {
  color: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
}

export function ColoringGame({ data, onCorrect }: Props) {
  const [color, setColor] = useState(data.palette[0]);
  const [isEraser, setIsEraser] = useState(false);
  const [segments, setSegments] = useState<Segment[]>([]);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const strokeColor = isEraser ? '#ffffff' : color;
  const strokeWidth = isEraser ? 24 : 12;

  const toLocal = (e: React.PointerEvent) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    drawing.current = true;
    last.current = toLocal(e);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drawing.current || !last.current) return;
    const p = toLocal(e);
    const prev = last.current;
    setSegments((prevSeg) => [
      ...prevSeg,
      { color: strokeColor, x1: prev.x, y1: prev.y, x2: p.x, y2: p.y, width: strokeWidth },
    ]);
    last.current = p;
  };

  const onPointerUp = () => {
    drawing.current = false;
    last.current = null;
  };

  return (
    <div className="coloring">
      <div className="coloring-palette">
        {data.palette.map((c) => (
          <button
            key={c}
            className={`color-swatch ${!isEraser && color === c ? 'color-swatch-active' : ''}`}
            style={{ background: c }}
            onClick={() => {
              setIsEraser(false);
              setColor(c);
            }}
            aria-label={`颜色${c}`}
          />
        ))}
        <button
          className={`eraser-button ${isEraser ? 'eraser-active' : ''}`}
          onClick={() => setIsEraser(true)}
          aria-label="橡皮"
        >
          🧽
        </button>
        <button className="clear-button" onClick={() => setSegments([])} aria-label="清空">
          🗑️
        </button>
      </div>
      <svg
        ref={svgRef}
        className="coloring-canvas"
        viewBox="0 0 320 320"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {segments.map((s, i) => (
          <line
            key={i}
            x1={s.x1}
            y1={s.y1}
            x2={s.x2}
            y2={s.y2}
            stroke={s.color}
            strokeWidth={s.width}
            strokeLinecap="round"
          />
        ))}
      </svg>
      <button className="big-button" onClick={onCorrect} aria-label="完成">
        完成
      </button>
    </div>
  );
}
