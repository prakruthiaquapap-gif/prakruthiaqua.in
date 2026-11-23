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
export default function HeroVideo({ clips, active, autoplay, onAdvance, onReady, onFallback }: {
  clips: (HeroClip | null)[];
  active: number;
  autoplay: boolean;
  onAdvance: () => void;
  onReady: (ready: boolean, slideSeconds?: number) => void;
  onFallback?: (slideIndex: number) => void;
}) {
  const [mobile, setMobile] = useState<boolean | null>(null);
  const [front, setFront] = useState<string | null>(null);
  const [activePlaying, setActivePlaying] = useState(false);
  const els = useRef<Record<string, HTMLVideoElement | null>>({});
  const state = useRef<{
    front: string | null;
    swapping: boolean;
    visible: boolean;
    autoplay: boolean;
    single: boolean;
    onAdvance: () => void;
    onReady: (ready: boolean, slideSeconds?: number) => void;
    onFallback?: (slideIndex: number) => void;
  }>({ front: null, swapping: false, visible: true, autoplay, onAdvance, onReady, onFallback, single: false });
  state.current.autoplay = autoplay;
  state.current.onAdvance = onAdvance;
  state.current.onReady = onReady;
  state.current.onFallback = onFallback;

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mq = window.matchMedia('(max-width: 720px)');
    const pick = () => setMobile(reduce.matches ? null : mq.matches);
    pick();
    mq.addEventListener('change', pick);
    reduce.addEventListener('change', pick);
    return () => {
      mq.removeEventListener('change', pick);
      reduce.removeEventListener('change', pick);
    };
  }, []);

  const srcs = mobile === null ? [] : clips.map((c) => (c ? (mobile ? c.mobile : c.desktop) : null));
  // Only one slide in total and it is a video: two copies dissolve into each other for a seamless loop.
  const single = srcs.length === 1 && !!srcs[0];
  state.current.single = single;
  const layers: { id: string; src: string; slideIndex: number }[] = single
    ? [{ id: '0a', src: srcs[0]!, slideIndex: 0 }, { id: '0b', src: srcs[0]!, slideIndex: 0 }]
    : srcs.flatMap((src, i) => (src ? [{ id: String(i), src, slideIndex: i }] : []));
  const key = layers.map((l) => `${l.id}:${l.src}`).join('|');

  const play = (v?: HTMLVideoElement | null) => {
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    v.play().catch(() => {});
  };
  const pauseOthers = (keep: string) => Object.entries(els.current).forEach(([id, v]) => {
    if (v && id !== keep) {
      v.pause();
      if (v.currentTime) v.currentTime = 0;
    }
  });

  /** Bring a video layer to the front, or null to fade video away and show the slide image. */
  const show = (id: string | null) => {
    const s = state.current;
    if (id === s.front) return;
    s.front = id;
    setFront(id);
    if (id === null) {
      s.onReady(false);
      window.setTimeout(() => { if (state.current.front === null) pauseOthers(''); s.swapping = false; }, FADE * 1000);
      return;
    }
    const v = els.current[id];
    if (!v) return;
    s.swapping = true;
    s.onReady(false);
    if (v.readyState >= 1 && v.currentTime > 0.25) v.currentTime = 0;
    play(v);
    window.setTimeout(() => { if (state.current.front === id) pauseOthers(id); s.swapping = false; }, FADE * 1000 + 150);
  };

  // Start playback and run the end-of-clip watcher when the set of video sources changes.
  useEffect(() => {
    if (!layers.length) {
      state.current.onReady(false);
      return;
    }
    state.current.front = null;
    const initialId = single ? '0a' : srcs[active] ? String(active) : null;
    show(initialId);

    let raf = 0;
    const tick = () => {
      const s = state.current;
      const v = s.front ? els.current[s.front] : null;
      if (v && s.visible && !s.swapping && v.duration && v.currentTime >= v.duration - FADE) {
        if (s.single) show(s.front === '0a' ? '0b' : '0a');
        // Ask for the next slide once; the guard is released when the next slide takes over.
        else if (s.autoplay) { s.swapping = true; s.onAdvance(); window.setTimeout(() => { state.current.swapping = false; }, 2500); }
        else { v.currentTime = 0; play(v); }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const io = new IntersectionObserver(([e]) => {
      const s = state.current;
      s.visible = e.isIntersecting;
      const v = s.front ? els.current[s.front] : null;
      if (e.isIntersecting) play(v);
      else Object.values(els.current).forEach((x) => x?.pause());
    });
    const box = Object.values(els.current).find(Boolean)?.parentElement;
    if (box) io.observe(box);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      Object.values(els.current).forEach((v) => v?.pause());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Follow the active slide (arrows, numbers, swipe or auto-advance).
  useEffect(() => {
    if (single || mobile === null) return;
    show(srcs[active] ? String(active) : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, key]);

  if (!layers.length) return null;
  const nextIndex = clips.length > 1 ? (active + 1) % clips.length : -1;

  return (
    <div className={`aqx-video${front ? ' is-ready' : ''}`} aria-hidden="true">
      {layers.map((l) => {
        const isCurrent = single ? l.id === (front || '0a') : l.slideIndex === active;
        const isNext = !single && l.slideIndex === nextIndex;
        // Dedicate full mobile bandwidth to the active video first; preload the next clip only after active is playing.
        const preload = isCurrent ? 'auto' : (activePlaying && isNext ? 'metadata' : 'none');
        return (
          <video
            key={`${l.id}-${l.src}`}
            ref={(el) => { els.current[l.id] = el; }}
            src={l.src}
            autoPlay={isCurrent}
            muted
            playsInline
            preload={preload}
            disablePictureInPicture
            disableRemotePlayback
            className={front === l.id ? 'is-front' : ''}
            onLoadedData={(e) => {
              if (state.current.front === l.id && e.currentTarget.paused && state.current.visible) {
                play(e.currentTarget);
              }
            }}
            onPlaying={(e) => {
              if (state.current.front === l.id) {
                setActivePlaying(true);
                state.current.onReady(true, Math.max(2, e.currentTarget.duration - FADE));
              }
            }}
            onError={() => {
              state.current.onFallback?.(l.slideIndex);
              if (state.current.front === l.id) state.current.onReady(false);
            }}
          />
        );
      })}
    </div>
  );
}
