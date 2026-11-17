'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from 'lucide-react';
import { useStorefront } from './storefront-data';
import { money, productHref } from '@/lib/catalog';
import { slideClip } from '@/lib/banner-data';
import { Bubbles } from './aquatic-fx';
import HeroVideo, { type HeroClip } from './hero-video';
import FitScreen from './fit-screen';

const INTERVAL = 7000;

export default function ImmersiveHero() {
  const { banners, products: catalog } = useStorefront();
  // Every published slide is shown, in order. Each is an image slide or a video slide (the admin's choice).
  const slides = banners;
  const clips: (HeroClip | null)[] = slides.map((s, i) => slideClip(s, i));
  const [active, setActive] = useState(0), [auto, setAuto] = useState(true), [hidden, setHidden] = useState(false);
  // A playing video drives its slide; image slides (and any video that can't play) use the timer.
  const [video, setVideo] = useState<{ ready: boolean; seconds: number }>({ ready: false, seconds: INTERVAL / 1000 });
  const root = useRef<HTMLElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const count = slides.length;
  const running = auto && !hidden && count > 1;

  useEffect(() => setActive((i) => Math.min(i, Math.max(0, count - 1))), [count]);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const reduce = () => { if (media.matches) setAuto(false); };
    reduce();
    media.addEventListener('change', reduce);
    const visibility = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', visibility);
    return () => { media.removeEventListener('change', reduce); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  // Fallback timer (no video): any change of slide restarts the full interval.
  useEffect(() => {
    if (!running || video.ready) return;
    const timer = window.setTimeout(() => setActive((i) => (i + 1) % count), INTERVAL);
    return () => window.clearTimeout(timer);
  }, [running, active, count, video.ready]);

  const go = (i: number) => setActive(((i % count) + count) % count);
  const onTouchStart = (e: React.TouchEvent) => { const t = e.touches[0]; touch.current = { x: t.clientX, y: t.clientY }; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touch.current; touch.current = null;
    if (!start) return;
    const t = e.changedTouches[0], dx = t.clientX - start.x, dy = t.clientY - start.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(active + (dx < 0 ? 1 : -1));
  };

  if (!count) return null;
  const current = slides[active % count];
  const pad = (n: number) => String(n).padStart(2, '0');
  const words = (text: string, offset = 0) => text.split(' ').map((w, i) => (
    <span className="aqx-word" key={`${w}-${i}`}><span style={{ animationDelay: `${0.15 + (i + offset) * 0.08}s` }}>{w}</span></span>
  ));

  return (
    <section
      ref={root}
      className="aqx"
      style={{ '--slide-dur': `${video.ready ? video.seconds : INTERVAL / 1000}s` } as React.CSSProperties}
      aria-roledescription="carousel"
      aria-label="Explore Prakruthi Aqua collections"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <FitScreen />
      <div className="aqx-media" aria-hidden="true">
        {slides.map((s, i) => (
          <img key={s.id} src={s.image} alt="" className={i === active ? 'is-visible' : ''} fetchPriority={i === 0 ? 'high' : 'low'} loading={i === 0 ? 'eager' : 'lazy'} />
        ))}
        <HeroVideo clips={clips} active={active} autoplay={running} onAdvance={() => setActive((i) => (i + 1) % count)} onReady={(ready, seconds) => setVideo((v) => ({ ready, seconds: seconds || v.seconds }))} />
      </div>
      <span className="aqx-veil" aria-hidden="true" />
      <Bubbles count={22} className="aqx-bubbles" />

      <div className="container aqx-inner">
        {/* Every slide sits in the same grid cell, so the hero keeps one height whatever the copy length. */}
        <div className="aqx-copies" aria-live={running ? 'off' : 'polite'}>
          {slides.map((s, i) => {
            const on = i === active;
            const Title = on ? 'h1' : 'p';
            return (
              <div key={s.id} className={`aqx-copy${on ? ' is-active' : ''}`} aria-hidden={!on} inert={!on}>
                <p className="aqx-eyebrow"><b>{pad(i + 1)}</b><i aria-hidden="true" />{s.eyebrow}</p>
                <Title className="aqx-title" aria-label={`${s.title} ${s.accent}`}>
                  <span className="aqx-line" aria-hidden="true">{words(s.title)}</span>
                  <em className="aqx-line" aria-hidden="true">{words(s.accent, s.title.split(' ').length)}</em>
                </Title>
                <p className="aqx-lead">{s.description}</p>
                <div className="aqx-actions">
                  <Link className="aqx-cta" href={s.href}><span>Shop the collection</span><i><ArrowUpRight size={18} /></i></Link>
                  <Link className="aqx-ghost" href="/about/"><span className="aqx-play"><Play size={13} fill="currentColor" /></span>Our story</Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="aqx-products">
          {slides.map((s, i) => {
            const on = i === active;
            const p = catalog.find((x) => x.slug === s.product);
            const name = (p?.name || s.productName || s.label).replace('Prakruthi Aqua ', '');
            const image = p?.image || s.productImage;
            return (
              <Link key={s.id} href={p ? productHref(p) : s.href} className={`aqx-product${on ? ' is-active' : ''}`} aria-hidden={!on} inert={!on}>
                <span className="aqx-product-img">{image && <img src={image} alt="" loading={i === 0 ? 'eager' : 'lazy'} />}</span>
                <span className="aqx-product-text">
                  <small>Featured · {s.label}</small>
                  <b>{name}</b>
                  <i>{p ? money(p.price) : 'View collection'}</i>
                </span>
                <span className="aqx-product-go"><ArrowUpRight size={17} /></span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="aqx-index" role="group" aria-label="Choose a slide">
        {slides.map((s, i) => (
          <button key={s.id} type="button" onClick={() => go(i)} aria-pressed={active === i} aria-label={`Show slide ${i + 1}: ${s.label}`}>
            <span>{pad(i + 1)}</span>
            <i><b key={active === i ? `${active}-${running}` : 'idle'} className={active === i && running ? 'run' : ''} /></i>
            <small>{s.label}</small>
          </button>
        ))}
      </div>

      <div className="container aqx-foot">
        <ul className="aqx-stats">
          <li><b>500<sup>+</sup></b><span>Happy aquarists</span></li>
          <li><b>50<sup>+</sup></b><span>Care products</span></li>
          <li><b>10<sup>+</sup></b><span>Years of care</span></li>
        </ul>
        <a className="aqx-scroll" href="#dive"><span className="aqx-mouse" aria-hidden="true"><i /></span>Scroll to dive</a>
        <div className="aqx-arrows">
          <button type="button" aria-label="Previous slide" onClick={() => go(active - 1)}><ArrowLeft size={16} /></button>
          <button type="button" aria-label="Next slide" onClick={() => go(active + 1)}><ArrowRight size={16} /></button>
          <button type="button" aria-label={auto ? 'Pause slideshow' : 'Play slideshow'} aria-pressed={!auto} onClick={() => setAuto((a) => !a)}>{auto ? <Pause size={14} /> : <Play size={14} />}</button>
        </div>
      </div>
      <span className="aqx-count" aria-hidden="true" key={current.id}>{pad(active + 1)}</span>
    </section>
  );
}
