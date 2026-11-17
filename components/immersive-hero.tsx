'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play, Truck, Leaf } from 'lucide-react';
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
    const timer = setInterval(() => setActive((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [running, active, slides.length]);

  const select = (i: number) => { setActive((i + slides.length) % slides.length); setAuto(false); };
  if (!current) return null;

  const productImage = spotlight?.image || current.productImage;
  const productName = (spotlight?.name || current.productName || '').replace('Prakruthi Aqua ', '');

  return (
    <section
      className="bn"
      aria-roledescription="carousel"
      aria-label="Explore Prakruthi Aqua collections"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocusCapture={() => setFocus(true)}
      onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocus(false); }}
    >
      <div className="bn-deco" aria-hidden="true">
        <span className="bn-shape" />
        <img className="bn-watermark" src="/images/prakruthi-icon.svg" alt="" />
      </div>

      <div className="container bn-grid">
        <div className="bn-copy" aria-live={auto ? 'off' : 'polite'} aria-atomic="true">
          <div key={current.id} className="fade-up">
            <p className="bn-eyebrow"><Leaf size={13} /> {current.eyebrow}</p>
            <h1>{current.title} <em>{current.accent}</em></h1>
            <p className="bn-lead">{current.description}</p>
            <div className="bn-actions">
              <Link className="btn btn-dark btn-lg" href={current.href}>Shop the collection <ArrowUpRight size={16} /></Link>
              <Link className="link-line" href="/about/">Our story <ArrowRight size={14} /></Link>
            </div>
          </div>
          <ul className="bn-stats">
            <li><b>500+</b><span>Happy aquarists</span></li>
            <li><b>50+</b><span>Care products</span></li>
            <li><b><Truck size={22} strokeWidth={1.6} /></b><span>Delivered across India</span></li>
          </ul>
        </div>

        <div className="bn-stage">
          <div className="bn-arch">
            {slides.map((s, i) => (
              <img key={s.id} src={s.image} alt={i === active ? s.alt : ''} aria-hidden={i !== active} className={i === active ? 'is-visible' : ''} fetchPriority={i === 0 ? 'high' : 'low'} loading={i === 0 ? 'eager' : 'lazy'} />
            ))}
          </div>
          {productImage && (
            <div className="bn-disc">
              <img key={productImage} className="fade-up" src={productImage} alt={productName} />
            </div>
          )}
          {spotlight && (
            <Link key={spotlight.slug} href={productHref(spotlight)} className="bn-price fade-up">
              <span><small>From this collection</small><b>{productName}</b><i>{money(spotlight.price)}</i></span>
              <span className="bn-price-go"><ArrowUpRight size={16} /></span>
            </Link>
          )}
          <span className="bn-badge" aria-hidden="true">
            <svg viewBox="0 0 120 120">
              <defs><path id="bn-circle" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" /></defs>
              <text><textPath href="#bn-circle" textLength="286" lengthAdjust="spacing">PRAKRUTHI AQUA ✦ MADE IN BENGALURU ✦</textPath></text>
            </svg>
            <img src="/images/prakruthi-icon.svg" alt="" />
          </span>
        </div>
      </div>

      <div className="container bn-nav">
        <div className="bn-thumbs" role="group" aria-label="Choose a slide">
          {slides.map((s, i) => (
            <button key={s.id} type="button" onClick={() => select(i)} aria-pressed={active === i} aria-label={`Show slide ${i + 1}: ${s.label}`}>
              <span className="bn-thumb"><img src={s.image} alt="" loading="lazy" /></span>
              <span className="bn-thumb-text"><small>0{i + 1}</small><b>{s.label}</b></span>
              <span className="bn-prog"><i key={active === i ? `${active}-${running}` : 'idle'} className={active === i && running ? 'run' : ''} /></span>
            </button>
          ))}
        </div>
        <div className="bn-arrows">
          <button type="button" aria-label="Previous slide" onClick={() => select(active - 1)}><ArrowLeft size={16} /></button>
          <button type="button" aria-label="Next slide" onClick={() => select(active + 1)}><ArrowRight size={16} /></button>
          <button type="button" aria-label={auto ? 'Pause slideshow' : 'Play slideshow'} aria-pressed={auto} onClick={() => setAuto((a) => !a)}>{auto ? <Pause size={14} /> : <Play size={14} />}</button>
        </div>
      </div>
    </section>
  );
}
