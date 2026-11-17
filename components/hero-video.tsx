'use client';
import { useEffect, useRef, useState } from 'react';
import type { HeroClip } from '@/lib/banner-data';

export type { HeroClip };
const FADE = 1.1; // seconds of cross-dissolve between clips

/**
 * Background video for the home hero. `clips` lines up with the slides: a clip for a video slide,
 * null for an image slide (the slide's image shows underneath while the video layer fades away).
 * Shortly before a video ends it asks the hero to move on, so video and text change together.
 * A single video slide loops seamlessly by dissolving between two copies.
 * Pauses off screen; renders nothing for reduced-motion users (slide images show instead).
 */
export default function HeroVideo({ clips, active, autoplay, onAdvance, onReady }: {
  clips: (HeroClip | null)[]; active: number; autoplay: boolean; onAdvance: () => void; onReady: (ready: boolean, slideSeconds?: number) => void;
}) {
  const [mobile, setMobile] = useState<boolean | null>(null);
  const [front, setFront] = useState<string | null>(null);
  const els = useRef<Record<string, HTMLVideoElement | null>>({});
  const state = useRef<{ front: string | null; swapping: boolean; visible: boolean; autoplay: boolean; single: boolean; onAdvance: () => void; onReady: (ready: boolean, slideSeconds?: number) => void }>({ front: null, swapping: false, visible: true, autoplay, onAdvance, onReady, single: false });
  state.current.autoplay = autoplay; state.current.onAdvance = onAdvance; state.current.onReady = onReady;

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const mq = window.matchMedia('(max-width: 720px)');
    const pick = () => setMobile(mq.matches);
    pick();
    mq.addEventListener('change', pick);
    return () => mq.removeEventListener('change', pick);
  }, []);

  const srcs = mobile === null ? [] : clips.map((c) => (c ? (mobile ? c.mobile : c.desktop) : null));
  // Only one slide in total and it is a video: two copies dissolve into each other for a seamless loop.
  const single = srcs.length === 1 && !!srcs[0];
  state.current.single = single;
  const layers: { id: string; src: string }[] = single
    ? [{ id: '0a', src: srcs[0]! }, { id: '0b', src: srcs[0]! }]
    : srcs.flatMap((src, i) => (src ? [{ id: String(i), src }] : []));
  const key = layers.map((l) => `${l.id}:${l.src}`).join('|');
  const play = (v?: HTMLVideoElement | null) => { if (v) v.play().catch(() => {}); };
  const pauseOthers = (keep: string) => Object.entries(els.current).forEach(([id, v]) => { if (v && id !== keep) { v.pause(); v.currentTime = 0; } });

  /** Bring a video layer to the front, or null to fade video away and show the slide image. */
  const show = (id: string | null) => {
    const s = state.current;
    if (id === s.front) return;
    s.front = id; setFront(id);
    if (id === null) { s.onReady(false); window.setTimeout(() => { if (state.current.front === null) pauseOthers(''); }, FADE * 1000); return; }
    const v = els.current[id]; if (!v) return;
    s.swapping = true; s.onReady(false);
    v.currentTime = 0; play(v);
    window.setTimeout(() => { if (state.current.front === id) pauseOthers(id); s.swapping = false; }, FADE * 1000 + 150);
  };

  // Load sources and run the end-of-clip watcher.
  useEffect(() => {
    if (!layers.length) { state.current.onReady(false); return; }
    Object.values(els.current).forEach((v) => { if (v) { v.muted = true; v.load(); } });
    state.current.front = null;
    show(single ? '0a' : srcs[active] ? String(active) : null);

    let raf = 0;
    const tick = () => {
      const s = state.current; const v = s.front ? els.current[s.front] : null;
      if (v && s.visible && !s.swapping && v.duration && v.currentTime >= v.duration - FADE) {
        if (s.single) show(s.front === '0a' ? '0b' : '0a');
        else if (s.autoplay) s.onAdvance();
        else { v.currentTime = 0; play(v); }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const io = new IntersectionObserver(([e]) => {
      const s = state.current; s.visible = e.isIntersecting;
      const v = s.front ? els.current[s.front] : null;
      if (e.isIntersecting) play(v); else Object.values(els.current).forEach((x) => x?.pause());
    });
    const box = Object.values(els.current).find(Boolean)?.parentElement; if (box) io.observe(box);
    return () => { cancelAnimationFrame(raf); io.disconnect(); Object.values(els.current).forEach((v) => v?.pause()); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Follow the active slide (arrows, numbers, swipe or auto-advance).
  useEffect(() => {
    if (single || mobile === null) return;
    show(srcs[active] ? String(active) : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, key]);

  if (!layers.length) return null;
  return (
    <div className={`aqx-video${front ? ' is-ready' : ''}`} aria-hidden="true">
      {layers.map((l) => (
        <video
          key={`${l.id}-${l.src}`}
          ref={(el) => { els.current[l.id] = el; }}
          src={l.src}
          muted
          playsInline
          preload={single || l.id === String(active) ? 'auto' : 'metadata'}
          disablePictureInPicture
          disableRemotePlayback
          className={front === l.id ? 'is-front' : ''}
          onPlaying={(e) => { if (state.current.front === l.id) state.current.onReady(true, Math.max(2, e.currentTarget.duration - FADE)); }}
          onError={() => { if (state.current.front === l.id) state.current.onReady(false); }}
        />
      ))}
    </div>
  );
}
