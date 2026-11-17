import type { CSSProperties } from 'react';
import { Bubbles, LightRays } from './aquatic-fx';

/* A living aquarium backdrop: light from the surface, fish schools at three depths,
   swaying plants on a sandy floor and drifting particles. Purely decorative. */

const FISH = 'M14 25 L0 9 C5 18 5 32 0 41 Z M12 25 C30 6 74 2 100 21 C105 24 105 27 100 30 C74 48 30 44 12 25 Z M44 11 C54 0 70 1 79 13 Z M52 39 C58 47 66 47 72 41 Z';

type School = { top: string; size: number; count: number; dur: number; delay: number; dir: 1 | -1; depth: 'far' | 'mid' | 'near' };
const schools: School[] = [
  { top: '14%', size: 26, count: 7, dur: 46, delay: -8, dir: 1, depth: 'far' },
  { top: '30%', size: 40, count: 5, dur: 34, delay: -20, dir: -1, depth: 'mid' },
  { top: '8%', size: 22, count: 9, dur: 58, delay: -40, dir: -1, depth: 'far' },
  { top: '52%', size: 58, count: 3, dur: 28, delay: -4, dir: 1, depth: 'near' },
];

function Fish({ i, school }: { i: number; school: School }) {
  const style = {
    '--fx': `${(i * 37) % 70}px`,
    '--fy': `${((i * 23) % 50) - 20}px`,
    '--fs': `${school.size * (0.8 + ((i * 7) % 5) * 0.08)}px`,
    '--wig': `${1.4 + ((i * 3) % 4) * 0.25}s`,
    '--bob': `${4 + (i % 3)}s`,
  } as CSSProperties;
  return (
    <span className="tank-fish" style={style}>
      <svg viewBox="0 0 106 50"><path d={FISH} /></svg>
    </span>
  );
}

const tones = {
  forest: ['var(--ink)', 'var(--forest-deep)', 'var(--forest)'],
  leaf: ['var(--forest-deep)', 'var(--lime-deep)', 'var(--leaf-bright)'],
  sage: ['var(--forest)', 'var(--lime-deep)', 'var(--sage)'],
};

/** Vallisneria-style ribbon grass: long tapering blades, shaded dark at the root and lighter at the tip. */
export function Grass({ id, x, h, blades, hue, delay, flip, depth = 'near' }: { id: string; x: string; h: number; blades: number; hue: keyof typeof tones; delay: number; flip?: boolean; depth?: 'near' | 'far' }) {
  const [a, b, c] = tones[hue];
  return (
    <span className={`tank-plant is-${depth}${flip ? ' is-flip' : ''}`} style={{ left: x, height: h } as CSSProperties}>
      <svg viewBox="0 0 200 400" preserveAspectRatio="xMidYMax meet">
        <defs>
          <linearGradient id={id} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" style={{ stopColor: a }} />
            <stop offset="0.55" style={{ stopColor: b }} />
            <stop offset="1" style={{ stopColor: c }} />
          </linearGradient>
        </defs>
        {Array.from({ length: blades }, (_, k) => {
          const off = (k - (blades - 1) / 2) * 16;
          const lean = (k % 2 ? 1 : -1) * (26 + ((k * 7) % 5) * 13);
          const top = 10 + ((k * 61) % 150);
          const w = 3 + (k % 3) * 0.8;
          const x0 = 100 + off;
          return (
            <path key={k} className="tank-blade" fill={`url(#${id})`}
              style={{ animationDelay: `${delay - k * 0.6}s`, animationDuration: `${5 + (k % 3)}s` } as CSSProperties}
              d={`M${x0 - w} 400 C ${x0 - w - 4} 300, ${x0 + lean * 0.6} 220, ${x0 + lean} ${top} Q ${x0 + lean + 3} ${top - 6} ${x0 + lean + 2} ${top + 8} C ${x0 + lean * 0.7 + w} 220, ${x0 + w + 2} 300, ${x0 + w} 400 Z`} />
          );
        })}
      </svg>
    </span>
  );
}

/** Amazon-sword style plant: broad lance-shaped leaves with a lighter midrib, fanning from the base. */
export function Sword({ id, x, h, leaves, hue, delay, flip, depth = 'near' }: { id: string; x: string; h: number; leaves: number; hue: keyof typeof tones; delay: number; flip?: boolean; depth?: 'near' | 'far' }) {
  const [a, b, c] = tones[hue];
  return (
    <span className={`tank-plant is-sword is-${depth}${flip ? ' is-flip' : ''}`} style={{ left: x, height: h } as CSSProperties}>
      <svg viewBox="0 0 200 400" preserveAspectRatio="xMidYMax meet">
        <defs>
          <linearGradient id={id} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" style={{ stopColor: a }} />
            <stop offset="0.5" style={{ stopColor: b }} />
            <stop offset="1" style={{ stopColor: c }} />
          </linearGradient>
        </defs>
        {Array.from({ length: leaves }, (_, k) => {
          const spread = leaves > 1 ? k / (leaves - 1) - 0.5 : 0;
          const angle = spread * 34;
          const bend = spread * 120;
          const len = 230 + ((k * 37) % 90);
          const wid = 26 + ((k * 11) % 12);
          return (
            <g key={k} className="tank-leaf" style={{ transform: `rotate(${angle}deg)`, animationDelay: `${delay - k * 0.5}s` } as CSSProperties}>
              <path className="tank-leaf-body" fill={`url(#${id})`}
                d={`M100 400 C ${100 - wid * 0.4 + bend * 0.15} ${400 - len * 0.3}, ${100 - wid + bend * 0.6} ${400 - len * 0.68}, ${100 + bend} ${400 - len} C ${100 + wid + bend * 0.6} ${400 - len * 0.68}, ${100 + wid * 0.4 + bend * 0.15} ${400 - len * 0.3}, 100 400 Z`} />
              <path className="tank-leaf-rib" d={`M100 398 C ${100 + bend * 0.15} ${400 - len * 0.3}, ${100 + bend * 0.6} ${400 - len * 0.68}, ${100 + bend * 0.97} ${400 - len + 10}`} />
            </g>
          );
        })}
      </svg>
    </span>
  );
}

export default function AquariumScene() {
  return (
    <div className="tank-scene" aria-hidden="true">
      <span className="tank-surface" />
      <LightRays className="tank-rays" />
      {schools.map((s, k) => (
        <span
          key={k}
          className={`tank-school is-${s.depth}${s.dir < 0 ? ' is-left' : ''}`}
          style={{ top: s.top, '--dur': `${s.dur}s`, '--delay': `${s.delay}s` } as CSSProperties}
        >
          {Array.from({ length: s.count }, (_, i) => <Fish key={i} i={i} school={s} />)}
        </span>
      ))}
      <span className="tank-floor" />
      <Sword id="pg1" x="-5%" h={330} leaves={8} hue="forest" delay={0} depth="far" />
      <Sword id="pg2" x="0%" h={250} leaves={6} hue="leaf" delay={-1.2} />
      <Sword id="pg7" x="93%" h={340} leaves={8} hue="forest" delay={-0.9} flip depth="far" />
      <Sword id="pg8" x="97%" h={230} leaves={6} hue="leaf" delay={-2.6} flip />
      <span className="tank-pebbles" />
      <Bubbles count={16} className="tank-bubbles" />
      <span className="tank-particles" />
    </div>
  );
}

/** Foreground plants that grow between the tank cards, in front of their lower edges. */
export function FrontPlants() {
  return (
    <div className="aqw-front" aria-hidden="true">
      <Grass id="fp0" x="0%" h={190} blades={9} hue="leaf" delay={-0.4} />
      <Sword id="fp1" x="20%" h={150} leaves={6} hue="leaf" delay={-1.1} flip />
      <Sword id="fp2" x="40%" h={130} leaves={5} hue="sage" delay={-2.2} />
      <Sword id="fp3" x="60%" h={145} leaves={6} hue="forest" delay={-0.8} />
      <Sword id="fp4" x="80%" h={140} leaves={6} hue="leaf" delay={-1.6} flip />
      <Grass id="fp5" x="100%" h={200} blades={9} hue="leaf" delay={-2.4} flip />
    </div>
  );
}
