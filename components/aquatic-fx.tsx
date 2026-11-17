import type { CSSProperties } from 'react';

/* Decorative, purely visual aquatic effects. Safe in server and client components. */

export function Bubbles({ count = 12, className = '' }: { count?: number; className?: string }) {
  return (
    <span className={`aq-bubbles ${className}`} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const style = {
          '--x': `${(i * 37 + 11) % 100}%`,
          '--s': `${6 + ((i * 7) % 5) * 4}px`,
          '--d': `${9 + ((i * 5) % 7) * 1.6}s`,
          '--delay': `${-((i * 13) % 17) * 0.9}s`,
          '--sway': `${(i % 2 ? 1 : -1) * (10 + ((i * 3) % 4) * 6)}px`,
        } as CSSProperties;
        return <i key={i} style={style} />;
      })}
    </span>
  );
}

export function LightRays({ className = '' }: { className?: string }) {
  return <span className={`aq-rays ${className}`} aria-hidden="true" />;
}

export function Caustics({ className = '' }: { className?: string }) {
  return <span className={`aq-caustics ${className}`} aria-hidden="true" />;
}

/** Layered, slowly drifting wave edge. `top` colour sits above, the wave fills with `fill`. */
export function Wave({ className = '', flip = false }: { className?: string; flip?: boolean }) {
  return (
    <div className={`aq-wave${flip ? ' aq-wave-flip' : ''} ${className}`} aria-hidden="true">
      <svg viewBox="0 0 2880 120" preserveAspectRatio="none">
        <path className="aq-wave-back" d="M0 70 C 240 20 480 20 720 60 S 1200 110 1440 70 S 1920 20 2160 60 S 2640 110 2880 70 V120 H0 Z" />
        <path className="aq-wave-front" d="M0 85 C 240 50 480 115 720 85 S 1200 45 1440 85 S 1920 115 2160 85 S 2640 45 2880 85 V120 H0 Z" />
      </svg>
    </div>
  );
}
