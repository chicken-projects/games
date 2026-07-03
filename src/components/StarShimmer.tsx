import { useEffect, useState } from "react";

interface Burst {
  key: number;
  x: number;
  y: number;
}

/** Emits a tiny burst of star particles from a given point. */
export function useStarShimmer() {
  const [bursts, setBursts] = useState<Burst[]>([]);
  const emit = (x: number, y: number) => {
    const key = Date.now() + Math.random();
    setBursts((b) => [...b, { key, x, y }]);
    setTimeout(() => setBursts((b) => b.filter((z) => z.key !== key)), 900);
  };
  return { bursts, emit };
}

export function StarBurst({ x, y }: { x: number; y: number }) {
  const [stars] = useState(() =>
    Array.from({ length: 16 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 16 + Math.random() * 0.3;
      const dist = 30 + Math.random() * 60;
      return {
        i,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        size: 2 + Math.random() * 3,
        delay: Math.random() * 120,
      };
    })
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 40 }}>
      {stars.map((s) => (
        <span
          key={s.i}
          className="absolute star-particle"
          style={{
            left: x,
            top: y,
            width: s.size,
            height: s.size,
            ["--dx" as string]: `${s.dx}px`,
            ["--dy" as string]: `${s.dy}px`,
            animationDelay: `${s.delay}ms`,
          }}
        />
      ))}
    </div>
  );
}

export function StarLayer({ bursts }: { bursts: { key: number; x: number; y: number }[] }) {
  return (
    <>
      {bursts.map((b) => (
        <StarBurst key={b.key} x={b.x} y={b.y} />
      ))}
    </>
  );
}
