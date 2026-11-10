'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, ChevronDown, Fish, Leaf, Bird, Droplets, ShieldCheck, Sparkles } from 'lucide-react';

export const productRanges = [
  { title: 'Freeze-Live Dried Foods', description: 'Premium freeze-dried food for optimal nutrition', href: '/shop/?category=Fish%20foods&range=freeze-dried-foods', icon: Fish },
  { title: 'Pellets Food', description: 'High-quality pellets for all fish species', href: '/shop/?category=Fish%20foods&range=pellets-food', icon: Sparkles },
  { title: 'Bird Foods', description: 'Nutritious food for aquatic birds', href: '/shop/?category=Bird%20foods', icon: Bird },
  { title: 'Fish Medicine', description: 'Effective treatments for fish health', href: '/shop/?category=Fish%20medicines', icon: ShieldCheck },
  { title: 'Plant Medicine / Plant Lushers', description: 'Fertilizers and treatments for aquatic plants', href: '/shop/?category=Plant%20fertilizers', icon: Leaf },
  { title: 'Aquarium Cleaner', description: 'Keep your aquarium crystal clear', href: '/shop/?category=Aquarium%20cleaners', icon: Droplets },
];

export default function ShopDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const path = usePathname();

  useEffect(() => {
    const dismiss = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, []);

  return (
    <div
      className="dropdown"
      ref={ref}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false); }}
      onKeyDown={(e) => { if (e.key === 'Escape') { setOpen(false); ref.current?.querySelector('button')?.focus(); } }}
    >
      <div className="dropdown-trigger">
        <Link href="/shop/" className="nav-link" aria-current={path.startsWith('/shop') ? 'page' : undefined} onClick={() => setOpen(false)}>Shop</Link>
        <button type="button" aria-label="Show product ranges" aria-expanded={open} aria-controls="header-product-ranges" onClick={() => setOpen((o) => !o)}>
          <ChevronDown size={14} />
        </button>
      </div>
      {open && (
        <div id="header-product-ranges" className="dropdown-panel">
          <div className="dropdown-head">
            <span>Our product range</span>
            <Link href="/shop/" onClick={() => setOpen(false)}>Shop all <ArrowUpRight size={13} /></Link>
          </div>
          <div className="dropdown-grid">
            {productRanges.map((r) => (
              <Link key={r.title} href={r.href} onClick={() => setOpen(false)}>
                <span className="dropdown-icon"><r.icon size={18} strokeWidth={1.6} /></span>
                <span><b>{r.title}</b><small>{r.description}</small></span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function MobileProductRanges({ onNavigate }: { onNavigate: () => void }) {
  return (
    <details className="mobile-ranges">
      <summary>Our product range <ChevronDown size={16} /></summary>
      {productRanges.map((r) => (
        <Link key={r.title} href={r.href} onClick={onNavigate}>
          <r.icon size={16} strokeWidth={1.6} />
          <span><b>{r.title}</b><small>{r.description}</small></span>
        </Link>
      ))}
    </details>
  );
}
