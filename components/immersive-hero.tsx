'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play, ShieldCheck, Truck } from 'lucide-react';
import { useStorefront } from './storefront-data';
import { money, productHref } from '@/lib/catalog';

export default function ImmersiveHero() {
  const { banners: slides, products: catalog } = useStorefront();
  const [active, setActive] = useState(0), [auto, setAuto] = useState(true), [hover, setHover] = useState(false), [focus, setFocus] = useState(false), [hidden, setHidden] = useState(false);
  const current = slides[active % Math.max(slides.length, 1)];
  const spotlight = catalog.find((p) => p.slug === current?.product);
  const running = auto && !hover && !focus && !hidden;

  useEffect(() => setActive((i) => Math.min(i, Math.max(0, slides.length - 1))), [slides.length]);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const reduce = () => { if (media.matches) setAuto(false); };
    reduce();
    media.addEventListener('change', reduce);
    const visibility = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', visibility);
    return () => { media.removeEventListener('change', reduce); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  useEffect(() => {
    if (!running || slides.length < 2) return;
    const timer = setInterval(() => setActive((i) => (i + 1) % slides.length), 7000);
    return () => clearInterval(timer);
  }, [running, active, slides.length]);

  const select = (i: number) => { setActive((i + slides.length) % slides.length); setAuto(false); };
  if (!current) return null;

  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      aria-label="Explore Prakruthi Aqua collections"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocusCapture={() => setFocus(true)}
      onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocus(false); }}
    >
      <div className="hero-photos">
        {slides.map((s, i) => (
          <img key={s.id} src={s.image} alt={i === active ? s.alt : ''} aria-hidden={i !== active} className={i === active ? 'is-visible' : ''} fetchPriority={i === 0 ? 'high' : 'low'} loading={i === 0 ? 'eager' : 'lazy'} />
        ))}
      </div>
      <div className="hero-shade" />

      <svg className="hero-badge" viewBox="0 0 120 120" aria-hidden="true">
        <defs><path id="hero-circle" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" /></defs>
        <text textLength="286" lengthAdjust="spacing"><textPath href="#hero-circle" textLength="286" lengthAdjust="spacing">PRAKRUTHI AQUA ✦ MADE IN BENGALURU ✦</textPath></text>
      </svg>
      <img className="hero-badge-logo" src="/images/prakruthi-icon.svg" alt="" aria-hidden="true" />

      <div className="container hero-inner">
        <div className="hero-copy" aria-live={auto ? 'off' : 'polite'} aria-atomic="true">
          <div key={current.id} className="fade-up">
            <p className="eyebrow eyebrow-line">{current.eyebrow}</p>
            <h1>{current.title}<br /><em>{current.accent}</em></h1>
            <p className="hero-lead">{current.description}</p>
            <div className="hero-actions">
              <Link className="btn btn-leaf" href={current.href}>Explore the collection <ArrowUpRight size={16} /></Link>
              <Link className="btn btn-ghost" href="/about/">Our story</Link>
            </div>
            <div className="hero-assurances"><span><ShieldCheck size={14} /> Quality aquarium care</span><span><Truck size={14} /> Delivery across India</span></div>
          </div>
        </div>

        {spotlight && (
          <Link key={spotlight.slug} href={productHref(spotlight)} className="hero-spotlight fade-up">
            <span className="hero-spotlight-img"><img src={spotlight.image} alt="" /></span>
            <span className="hero-spotlight-text">
              <small>From this collection</small>
              <b>{spotlight.name.replace('Prakruthi Aqua ', '')}</b>
              <span>{money(spotlight.price)}</span>
            </span>
            <ArrowUpRight size={18} />
          </Link>
        )}
      </div>

      <div className="hero-bar">
        <div className="container hero-bar-inner">
          <span className="hero-count">{String(active + 1).padStart(2, '0')}<small> / {String(slides.length).padStart(2, '0')}</small></span>
          <div className="hero-tabs" role="group" aria-label="Choose a slide">
            {slides.map((s, i) => (
              <button key={s.id} type="button" onClick={() => select(i)} aria-pressed={active === i} aria-label={`Show slide ${i + 1}: ${s.label}`}>
                <span className="hero-tab-bar"><i key={active === i ? `${active}-${running}` : 'idle'} className={active === i && running ? 'run' : ''} /></span>
                <b>{s.label}</b>
              </button>
            ))}
          </div>
          <div className="hero-arrows">
            <button type="button" aria-label="Previous slide" onClick={() => select(active - 1)}><ArrowLeft size={16} /></button>
            <button type="button" aria-label="Next slide" onClick={() => select(active + 1)}><ArrowRight size={16} /></button>
            <button type="button" aria-label={auto ? 'Pause slideshow' : 'Play slideshow'} aria-pressed={auto} onClick={() => setAuto((a) => !a)}>{auto ? <Pause size={14} /> : <Play size={14} />}</button>
          </div>
        </div>
      </div>
    </section>
  );
}
