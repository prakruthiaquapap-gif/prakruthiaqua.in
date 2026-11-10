'use client';
import Link from 'next/link';
import { createContext, useContext, useEffect, useState } from 'react';
import { Heart, ArrowRight } from 'lucide-react';
import { type Product } from '@/lib/catalog';
import { useStorefront } from './storefront-data';
import { ProductCard } from './site';

const WishlistContext = createContext<{ saved: string[]; toggle: (slug: string) => void; ready: boolean }>({ saved: [], toggle: () => {}, ready: false });

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [saved, setSaved] = useState<string[]>([]), [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const value: unknown = JSON.parse(localStorage.getItem('prakruthi-wishlist') || '[]');
      if (Array.isArray(value)) setSaved([...new Set(value.filter((s): s is string => typeof s === 'string'))]);
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) { try { localStorage.setItem('prakruthi-wishlist', JSON.stringify(saved)); } catch {} }
  }, [saved, ready]);
  const toggle = (slug: string) => setSaved((s) => (s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug]));
  return <WishlistContext.Provider value={{ saved, toggle, ready }}>{children}</WishlistContext.Provider>;
}

export function WishlistButton({ product: p, detail = false }: { product: Product; detail?: boolean }) {
  const { saved, toggle, ready } = useContext(WishlistContext);
  const selected = saved.includes(p.slug);
  return (
    <button
      type="button"
      disabled={!ready}
      onClick={() => toggle(p.slug)}
      className={`wish-btn ${detail ? 'wish-detail' : 'wish-card'} ${selected ? 'is-saved' : ''}`}
      aria-pressed={selected}
      aria-label={`${selected ? 'Remove' : 'Save'} ${p.name} ${selected ? 'from' : 'to'} wishlist`}
      title={selected ? 'Remove from wishlist' : 'Save to wishlist'}
    >
      <Heart size={detail ? 18 : 16} fill={selected ? 'currentColor' : 'none'} />
      {detail && <span>{selected ? 'Saved' : 'Save to wishlist'}</span>}
    </button>
  );
}

export function WishlistLink() {
  const { saved } = useContext(WishlistContext);
  return (
    <Link className="icon-btn wish-link" href="/wishlist/" aria-label={`Wishlist, ${saved.length} saved products`}>
      <Heart size={19} />
      {saved.length > 0 && <span className="badge">{saved.length}</span>}
    </Link>
  );
}

export function WishlistContents() {
  const { products } = useStorefront();
  const { saved, ready } = useContext(WishlistContext);
  if (!ready) return <p className="muted">Loading your favourites…</p>;
  const items = products.filter((p) => saved.includes(p.slug));
  if (!items.length) {
    return (
      <div className="empty-state">
        <span className="empty-icon"><Heart size={28} strokeWidth={1.5} /></span>
        <h2>No favourites yet.</h2>
        <p>Tap the heart on any product to save it here for later.</p>
        <Link className="btn btn-dark" href="/shop/">Explore the shop <ArrowRight size={16} /></Link>
      </div>
    );
  }
  return (
    <>
      <p className="muted result-count">{items.length} {items.length === 1 ? 'product' : 'products'} saved on this browser</p>
      <div className="product-grid">{items.map((p) => <ProductCard key={p.slug} product={p} />)}</div>
    </>
  );
}
