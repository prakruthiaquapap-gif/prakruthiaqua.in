'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ShoppingBag, Pause, Play } from 'lucide-react';
import { ProductCard, useBag } from './site';
import { useStorefront } from './storefront-data';
import { money, productHref, type Product } from '@/lib/catalog';

export function Carousel({ products, label, fiveColumns = false }: { products: Product[]; label: string; fiveColumns?: boolean }) {
  const track = useRef<HTMLDivElement>(null);
  const [auto, setAuto] = useState(true);
  const [hover, setHover] = useState(false);
  const [focused, setFocused] = useState(false);
  const holdUntil = useRef(0);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => { if (media.matches) setAuto(false); };
    change(); media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    if (!auto || hover || focused || products.length < 2) return;
    const timer = window.setInterval(() => {
      const el = track.current;
      if (!el || document.hidden || Date.now() < holdUntil.current) return;
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const card = el.firstElementChild as HTMLElement | null;
      if (!card || el.scrollWidth <= el.clientWidth + 2) return;
      const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
      const end = el.scrollLeft >= el.scrollWidth - el.clientWidth - 3;
      el.scrollTo({ left: end ? 0 : el.scrollLeft + card.offsetWidth + gap, behavior: 'smooth' });
    }, 3500);
    return () => window.clearInterval(timer);
  }, [auto, hover, focused, products.length]);
  const move = (dir: number) => {
    setAuto(false);
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };
  return (
    <div className="carousel" onPointerEnter={e => { if (e.pointerType === 'mouse') setHover(true); }} onPointerLeave={() => setHover(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocused(false); }} onTouchStart={() => { holdUntil.current = Date.now() + 8000; }}>
      <div className="carousel-arrows">
        <button type="button" aria-label={auto ? 'Pause product scrolling' : 'Play product scrolling'} aria-pressed={auto} onClick={() => setAuto(a => !a)}>{auto ? <Pause size={16} /> : <Play size={16} />}</button>
        <button type="button" onClick={() => move(-1)} aria-label={`Previous ${label}`}><ArrowLeft size={17} /></button>
        <button type="button" onClick={() => move(1)} aria-label={`Next ${label}`}><ArrowRight size={17} /></button>
      </div>
      <div className={`carousel-track${fiveColumns ? " carousel-track-five" : ""}`} ref={track} role="list" aria-label={label}>
        {products.map((p) => <div role="listitem" className="carousel-item" key={p.slug}><ProductCard product={p} /></div>)}
      </div>
    </div>
  );
}

export function LatestProducts() {
  const { products } = useStorefront();
  const featured = products.filter((p) => p.featured);
  const list = [...featured, ...products.filter((p) => !p.featured)];
  return <Carousel products={list} label="latest products" fiveColumns />;
}

const promoImage: Record<string, string> = {
  'All products': '/images/water.jpg',
  'Fish foods': '/images/aquarium.jpg',
  'Plant fertilizers': '/images/plants.jpg',
  'Fish medicines': '/images/aquarium-essentials.jpg',
  'Aquarium cleaners': '/images/water.jpg',
  'Bird foods': '/images/birds.jpg',
};

export function Spotlight() {
  const { products } = useStorefront();
  const { add } = useBag();
  const p = products.find((x) => x.slug.startsWith('carnivorx')) || products.find((x) => x.featured) || products[0];
  const picks = products.filter((x) => x.category === p?.category && x.slug !== p?.slug).slice(0, 3);
  if (!p) return null;
  return (
    <div className="spot">
      <div className="spot-visual">
        <span className="spot-ring" aria-hidden="true" />
        <span className="spot-disc" aria-hidden="true" />
        <img src={p.image} alt={p.name} loading="lazy" />
        <span className="spot-tag">{p.category}</span>
      </div>
      <div className="spot-copy">
        <p className="eyebrow eyebrow-line">Product spotlight</p>
        <h2>{p.name.replace('Prakruthi Aqua ', '')}</h2>
        <p className="spot-desc">{p.description || 'A favourite treat for carnivorous and omnivorous fish — easy to portion, easy to store, and loved at feeding time. Our team will confirm current pack sizes and stock before you pay.'}</p>
        <ul className="spot-perks">
          <li><Check size={16} /> Easy to store &amp; serve</li>
          <li><Check size={16} /> Packed with care in Bengaluru</li>
          <li><Check size={16} /> Availability confirmed by our team</li>
        </ul>
        <div className="spot-buy">
          <span className="spot-price">{money(p.price)}</span>
          <button className="btn btn-leaf" onClick={() => add(p)}><ShoppingBag size={16} /> Add to cart</button>
          <Link className="btn btn-ghost" href={productHref(p)}>View details</Link>
        </div>
        {picks.length > 0 && (
          <div className="spot-picks">
            <small>Pairs well with</small>
            <div>
              {picks.map((x) => (
                <Link key={x.slug} href={productHref(x)} className="spot-pick">
                  <span><img src={x.image} alt="" /></span>
                  <div><b>{x.name.replace('Prakruthi Aqua ', '')}</b><i>{money(x.price)}</i></div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ShopByNeed() {
  const { products, categories } = useStorefront();
  const [active, setActive] = useState('All products');
  const list = products.filter((p) => active === 'All products' || p.category === active);
  return (
    <>
      <div className="pills" role="group" aria-label="Filter by category">
        {categories.map((c) => (
          <button key={c} className="pill" aria-pressed={active === c} onClick={() => setActive(c)}>
            {c === 'All products' ? 'All' : `#${c.replace(/\s+/g, '')}`}
          </button>
        ))}
      </div>
      <div className="need-grid">
        <Link className="need-promo" href={active === 'All products' ? '/shop/' : `/shop/?category=${encodeURIComponent(active)}`}>
          <img src={promoImage[active] || '/images/water.jpg'} alt="" loading="lazy" />
          <span className="need-promo-copy">
            <small>{list.length} products</small>
            <b>{active === 'All products' ? 'Everything your aquarium needs' : active}</b>
            <span>Shop the range <ArrowUpRight size={14} /></span>
          </span>
        </Link>
        {list.slice(0, 8).map((p) => <ProductCard key={p.slug} product={p} />)}
      </div>
      <div className="center-link">
        <Link className="link-line" href={active === 'All products' ? '/shop/' : `/shop/?category=${encodeURIComponent(active)}`}>
          View all {active === 'All products' ? 'products' : active.toLowerCase()} <ArrowUpRight size={15} />
        </Link>
      </div>
    </>
  );
}
