'use client';
import { useAuthPopup } from './auth-popup';
import ShopDropdown, { MobileProductRanges } from './shop-dropdown';
import { WishlistButton, WishlistLink } from './wishlist';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import {
  ArrowUpRight, ArrowRight, Search, ShoppingBag, UserRound, Menu, X,
  Plus, Minus, Trash2, Leaf, ShieldCheck, Truck, Headphones, PhoneCall, Mail, MapPin, MessageCircle,
  Home, Store, Heart, Check,
} from 'lucide-react';
import { money, productHref, type Product } from '@/lib/catalog';
import { useStorefront } from './storefront-data';

type Item = { slug: string; quantity: number };

const Context = createContext<{ add: (p: Product) => void; open: () => void; items: Item[]; clear: () => void }>({
  add: () => {},
  open: () => {}, items: [], clear: () => {},
});

export const useBag = () => useContext(Context);

const nav = [
  ['/', 'Home'],
  ['/shop/', 'Shop'],
  ['/about/', 'Our Story'],
  ['/contact/', 'Contact'],
];

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className={`brand ${light ? 'brand-light' : ''}`} aria-label="Prakruthi Aqua home">
      {light ? <img className="brand-full-logo" src="/images/prakruthi-full-logo.png" alt="Prakruthi Aqua Products" /> : <><span className="brand-mark"><img src="/images/prakruthi-icon.svg" alt="" /></span><img className="brand-original-wordmark" src="/images/prakruthi-wordmark.svg" alt="Prakruthi Aqua Products" /></>}
    </Link>
  );
}

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const { open: openAccount } = useAuthPopup();
  const { products } = useStorefront();
  const [bag, setBag] = useState<Item[]>([]);
  const [ready, setReady] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const path = usePathname();

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('prakruthi-bag') || '[]');
      if (Array.isArray(saved)) {
        setBag(saved.filter((i: Item) => typeof i?.slug === 'string' && Number.isInteger(i.quantity) && i.quantity > 0));
      }
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) try { localStorage.setItem('prakruthi-bag', JSON.stringify(bag)); } catch {}
  }, [bag, ready]);

  useEffect(() => { setMenu(false); setSearch(false); setDrawer(false); }, [path]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setDrawer(false); setMenu(false); setSearch(false); }
    };
    document.addEventListener('keydown', fn);
    document.body.style.overflow = drawer || search || menu ? 'hidden' : '';
    return () => { document.removeEventListener('keydown', fn); document.body.style.overflow = ''; };
  }, [drawer, search, menu]);

  const add = (p: Product) => {
    setBag((b) => b.some((i) => i.slug === p.slug)
      ? b.map((i) => (i.slug === p.slug ? { ...i, quantity: i.quantity + 1 } : i))
      : [...b, { slug: p.slug, quantity: 1 }]);
    setDrawer(true);
  };

  const visibleBag = bag.filter((i) => products.some((p) => p.slug === i.slug));
  const count = visibleBag.reduce((s, i) => s + i.quantity, 0);
  const total = visibleBag.reduce((s, i) => s + (products.find((p) => p.slug === i.slug)?.price || 0) * i.quantity, 0);
  const ctx = { add, open: () => setDrawer(true), items: visibleBag, clear: () => setBag([]) };
  const results = products.filter((p) => `${p.name} ${p.category}`.toLowerCase().includes(query.toLowerCase())).slice(0, 6);

  if (path.startsWith('/admin')) return <Context.Provider value={ctx}>{children}</Context.Provider>;

  return (
    <Context.Provider value={ctx}>
      <div className={`site-chrome ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="announce">
          <div className="container announce-inner">
            <span className="announce-left"><Leaf size={13} /> A little care. A world of life.</span>
            <span className="announce-mid">Delivered across India · Order requests confirmed personally</span>
            <a href="tel:+918904373735" className="announce-phone"><PhoneCall size={13} /> +91 89043 73735</a>
          </div>
        </div>

        <header className="site-header">
          <div className="container header-inner">
            <Logo />

            <nav className="header-nav" aria-label="Main">
              {nav.map(([url, label]) => url === '/shop/'
                ? <ShopDropdown key={url} />
                : <Link key={url} href={url} className="nav-link" aria-current={path === url ? 'page' : undefined}>{label}</Link>)}
            </nav>

            <div className="header-tools">
              <Link className="header-cta" href="/business-enquiry/">Business Enquiry <ArrowUpRight size={14} /></Link>
              <button className="icon-btn" onClick={() => setSearch(true)} aria-label="Search products"><Search size={19} /></button>
              <WishlistLink />
              <button className="icon-btn hide-sm" onClick={openAccount} aria-label="Account"><UserRound size={19} /></button>
              <button className="bag-btn" onClick={() => setDrawer(true)} aria-label={`Open your cart, ${count} items`}>
                <ShoppingBag size={17} />
                <span>{count}</span>
              </button>
              <button className="icon-btn menu-btn" onClick={() => setMenu(true)} aria-label="Open menu"><Menu size={22} /></button>
            </div>
          </div>
        </header>
        <div className="ticker" aria-hidden="true">
          <div className="ticker-track">
            {[0, 1].map((k) => (
              <span key={k}>
                {['Healthy fish', 'Lush planted tanks', 'Crystal-clear water', 'Made in Bengaluru', 'Trusted by aquarists', 'Delivered across India', 'Expert guidance'].map((t) => <span key={t}>{t}<i>✦</i></span>)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {children}

      <footer className="site-footer">
        <div className="container">
          <div className="footer-cta">
            <div>
              <p className="eyebrow eyebrow-leaf">Need a hand?</p>
              <h2>Not sure what your tank needs? <em>Ask us.</em></h2>
            </div>
            <div className="footer-cta-actions">
              <a className="btn btn-leaf" href="https://wa.me/918904373735" target="_blank" rel="noreferrer"><MessageCircle size={17} /> Chat on WhatsApp</a>
              <Link className="btn btn-outline-light" href="/contact/">Contact us <ArrowRight size={16} /></Link>
            </div>
          </div>

          <div className="footer-grid">
            <div className="footer-brand">
              <Logo light />
              <p>Fish nutrition, plant care, water care and bird food — made with care in Bengaluru for the little worlds you look after.</p>

            </div>
            <div>
              <h3>Shop</h3>
              <ul>
                <li><Link href="/shop/?category=Fish%20foods">Fish foods</Link></li>
                <li><Link href="/shop/?category=Plant%20fertilizers">Plant fertilizers</Link></li>
                <li><Link href="/shop/?category=Fish%20medicines">Fish medicines</Link></li>
                <li><Link href="/shop/?category=Aquarium%20cleaners">Aquarium cleaners</Link></li>
                <li><Link href="/shop/?category=Bird%20foods">Bird foods</Link></li>
              </ul>
            </div>
            <div>
              <h3>Company</h3>
              <ul>
                <li><Link href="/about/">Our story</Link></li>
                <li><Link href="/contact/">Contact</Link></li>
                <li><Link href="/business-enquiry/">Business enquiry</Link></li>
                <li><a href="https://dealers.prakruthiaqua.in/" target="_blank" rel="noopener noreferrer">Become a dealer <ArrowUpRight size={12} /></a></li>
                <li><button onClick={openAccount}>Account</button></li>
                <li><Link href="/wishlist/">Wishlist</Link></li>
              </ul>
            </div>
            <div>
              <h3>Hours</h3>
              <ul className="footer-hours">
                <li><span>Mon – Fri</span> 9:00 – 18:00</li>
                <li><span>Saturday</span> 10:00 – 16:00</li>
                <li><span>Sunday</span> Closed</li>
              </ul>
            </div>
          </div>

              <div className="footer-contact">
                <a href="tel:+918904373735"><PhoneCall size={15} /> +91 89043 73735</a>
                <a href="mailto:info@prakruthiaqua.in"><Mail size={15} /> info@prakruthiaqua.in</a>
                <span><MapPin size={15} /> Yelahanka New Town, Bengaluru</span>
              </div>

          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Prakruthi Aqua. All rights reserved.</span>
            <nav aria-label="Legal">
              <Link href="/terms-and-conditions/">Terms &amp; Conditions</Link>
              <Link href="/privacy-policy/">Privacy Policy</Link>
            </nav>
            <span>Designed &amp; developed by <a href="https://rakvih.in/" target="_blank" rel="noreferrer">Rakvih</a></span>
          </div>
        </div>
      </footer>

      <nav className="tabbar" aria-label="Quick navigation">
        <Link href="/" aria-current={path === '/' ? 'page' : undefined}><Home size={20} /><span>Home</span></Link>
        <Link href="/shop/" aria-current={path.startsWith('/shop') ? 'page' : undefined}><Store size={20} /><span>Shop</span></Link>
        <button onClick={() => setSearch(true)}><Search size={20} /><span>Search</span></button>
        <Link href="/wishlist/" aria-current={path.startsWith('/wishlist') ? 'page' : undefined}><Heart size={20} /><span>Wishlist</span></Link>
        <button onClick={() => setDrawer(true)}><span className="tabbar-bag"><ShoppingBag size={20} />{count > 0 && <b>{count}</b>}</span><span>Bag</span></button>
      </nav>

      {menu && (
        <div className="overlay" onClick={() => setMenu(false)}>
          <div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-head">
              <Logo />
              <button className="icon-btn" onClick={() => setMenu(false)} aria-label="Close menu"><X size={22} /></button>
            </div>
            <nav className="mobile-menu-links">
              {[...nav, ['/business-enquiry/', 'Business Enquiry'], ['/wishlist/', 'Wishlist'], ['/account/', 'Account']].map(([url, label]) => (
                <Link key={url} href={url} onClick={(e) => { setMenu(false); if (url === '/account/') { e.preventDefault(); openAccount(); } }} aria-current={path === url ? 'page' : undefined}>
                  {label} <ArrowUpRight size={18} />
                </Link>
              ))}
            </nav>
            <a className="btn btn-leaf btn-block" href="https://dealers.prakruthiaqua.in/" target="_blank" rel="noopener noreferrer">Become a dealer <ArrowUpRight size={16} /></a>
            <MobileProductRanges onNavigate={() => setMenu(false)} />
            <a className="btn btn-dark btn-block" href="tel:+918904373735"><PhoneCall size={16} /> Call +91 89043 73735</a>
          </div>
        </div>
      )}

      {search && (
        <div className="overlay overlay-top" onClick={() => setSearch(false)}>
          <div className="search-panel" role="dialog" aria-modal="true" aria-label="Search products" onClick={(e) => e.stopPropagation()}>
            <div className="search-field">
              <Search size={20} />
              <input autoFocus placeholder="Search fish food, plant care, water care…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search products" />
              <button className="icon-btn" onClick={() => setSearch(false)} aria-label="Close search"><X size={20} /></button>
            </div>
            <div className="search-results">
              {results.length ? results.map((p) => (
                <Link key={p.slug} href={productHref(p)} onClick={() => setSearch(false)} className="search-result">
                  <span className="thumb"><img src={p.image} alt="" /></span>
                  <span className="search-result-text"><b>{p.name}</b><small>{p.category}</small></span>
                  <span className="price">{money(p.price)}</span>
                </Link>
              )) : <p className="search-empty">No products match “{query}”.</p>}
            </div>
          </div>
        </div>
      )}

      {drawer && (
        <div className="overlay overlay-right" onClick={() => setDrawer(false)}>
          <aside className="cart" role="dialog" aria-modal="true" aria-label="Your cart" onClick={(e) => e.stopPropagation()}>
            <div className="cart-head">
              <div>
                <h2>Your cart</h2>
                <span>{count} {count === 1 ? 'item' : 'items'}</span>
              </div>
              <button className="icon-btn" onClick={() => setDrawer(false)} aria-label="Close cart"><X size={20} /></button>
            </div>

            {count === 0 ? (
              <div className="cart-empty">
                <span className="cart-empty-icon"><ShoppingBag size={26} /></span>
                <h3>Your cart is empty</h3>
                <p>Explore fish food, plant care and water essentials for your aquarium.</p>
                <Link href="/shop/" onClick={() => setDrawer(false)} className="btn btn-dark">Start shopping <ArrowRight size={16} /></Link>
              </div>
            ) : (
              <>
                <div className="cart-lines">
                  {visibleBag.map((i) => {
                    const p = products.find((prod) => prod.slug === i.slug)!;
                    return (
                      <div key={i.slug} className="cart-line">
                        <span className="thumb"><img src={p.image} alt="" /></span>
                        <div className="cart-line-body">
                          <Link href={productHref(p)} onClick={() => setDrawer(false)}>{p.name}</Link>
                          <span className="price">{money(p.price)}</span>
                          <div className="cart-line-actions">
                            <div className="qty qty-sm">
                              <button aria-label={`Decrease ${p.name}`} onClick={() => setBag((b) => b.flatMap((x) => x.slug === i.slug ? (x.quantity > 1 ? [{ ...x, quantity: x.quantity - 1 }] : []) : [x]))}><Minus size={13} /></button>
                              <output>{i.quantity}</output>
                              <button aria-label={`Increase ${p.name}`} onClick={() => setBag((b) => b.map((x) => x.slug === i.slug ? { ...x, quantity: x.quantity + 1 } : x))}><Plus size={13} /></button>
                            </div>
                            <button className="link-remove" onClick={() => setBag((b) => b.filter((x) => x.slug !== i.slug))} aria-label={`Remove ${p.name}`}><Trash2 size={14} /> Remove</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="cart-foot">
                  <div className="cart-total"><span>Subtotal</span><b>{money(total)}</b></div>
                  <p>Shipping and final availability are confirmed by our team before payment.</p>
                  <a href="/checkout/" onClick={() => setDrawer(false)} className="btn btn-dark btn-block">Checkout <ArrowRight size={16} /></a>
                  <a
                    href={`https://wa.me/918904373735?text=${encodeURIComponent('Hi Prakruthi Aqua! I would like to enquire about:\n' + visibleBag.map((i) => `${products.find((p) => p.slug === i.slug)!.name} × ${i.quantity}`).join('\n'))}`}
                    target="_blank" rel="noreferrer" className="btn btn-outline btn-block"
                  >
                    <MessageCircle size={16} /> Enquire on WhatsApp
                  </a>
                </div>
              </>
            )}
          </aside>
        </div>
      )}
    </Context.Provider>
  );
}

const blurbs: Record<string, string> = {
  'Fish foods': 'Wholesome nutrition for vibrant, active fish.',
  'Plant fertilizers': 'Feeds lush, healthy aquatic plant growth.',
  'Fish medicines': 'Gentle, dependable care for fish health.',
  'Aquarium cleaners': 'Keeps your water clear and balanced.',
  'Bird foods': 'Nourishing seed blends for happy birds.',
};

export function ProductCard({ product: p }: { product: Product; index?: number }) {
  const { add } = useBag();
  const name = p.name.replace('Prakruthi Aqua Fish Food ', '').replace('Prakruthi Aqua Medicine ', '').replace('Prakruthi Aqua ', '');
  const soldOut = p.stock === 0;
  const [added, setAdded] = useState(false);
  useEffect(() => { if (!added) return; const t = setTimeout(() => setAdded(false), 1600); return () => clearTimeout(t); }, [added]);
  const onAdd = () => { add(p); setAdded(true); };
  return (
    <article className={`pcard ${soldOut ? 'is-soldout' : ''}`}>
      <div className="pcard-media">
        <div className="pcard-badges">
          {p.featured && <span className="pcard-badge pcard-badge-leaf">Bestseller</span>}
          {soldOut && <span className="pcard-badge">Sold out</span>}
        </div>
        <WishlistButton product={p} />
        <Link href={productHref(p)} tabIndex={-1} aria-hidden="true" className="pcard-img">
          <img src={p.image} alt="" loading="lazy" />
        </Link>
        <Link href={productHref(p)} className="pcard-view" tabIndex={-1} aria-hidden="true">View details <ArrowUpRight size={14} /></Link>
      </div>
      <div className="pcard-body">
        <div className="pcard-meta">
          <span>{p.category}</span>
          <span className={`stock ${soldOut ? 'stock-out' : ''}`}>{soldOut ? 'Sold out' : 'In stock'}</span>
        </div>
        <h3><Link href={productHref(p)}>{name}</Link></h3>
        <p>{p.description || blurbs[p.category] || 'Thoughtful care for your aquarium.'}</p>
        <div className="pcard-foot">
          <span className="pcard-price">{money(p.price)}</span>
          <button className={`pcard-add ${added ? 'is-added' : ''}`} onClick={onAdd} disabled={soldOut} aria-label={`Add ${p.name} to cart`}>
            {added ? <><Check size={15} strokeWidth={2.5} /> Added</> : <><ShoppingBag size={15} /> Add</>}
          </button>
        </div>
      </div>
    </article>
  );
}

export function Benefits() {
  return (
    <div className="benefits">
      <div className="container benefits-grid">
        {([
          [Leaf, 'Made for aquatic life', 'Nutrition and care formulated for fish, plants and water.'],
          [ShieldCheck, 'Quality you can trust', 'Carefully selected products for healthy aquariums.'],
          [Truck, 'Delivered across India', 'Packed with care and dispatched from Bengaluru.'],
          [Headphones, 'Real help, real people', 'Talk to our team before you buy — we’re happy to guide.'],
        ] as const).map(([Icon, title, text]) => (
          <div key={title} className="benefit">
            <span className="benefit-icon"><Icon size={20} strokeWidth={1.6} /></span>
            <div><h3>{title}</h3><p>{text}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}
