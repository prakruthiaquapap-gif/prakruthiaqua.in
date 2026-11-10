'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Plus, Minus, Expand, X, MessageCircle, ShoppingBag, Info, ChevronDown, Truck, ShieldCheck, Headphones } from 'lucide-react';
import { type Product, money, description } from '@/lib/catalog';
import { useBag } from './site';
import { WishlistButton } from './wishlist';
import { useStorefront } from './storefront-data';

const tabs = [['overview', 'Details'], ['directions', 'Care & directions'], ['ordering', 'Ordering & delivery']] as const;

export default function ProductDetail({ product: initialProduct }: { product: Product }) {
  const { products, loading } = useStorefront();
  const p = products.find((item) => item.slug === initialProduct.slug) || initialProduct;
  const { add } = useBag();
  const [quantity, setQuantity] = useState(1), [zoom, setZoom] = useState(false), [tab, setTab] = useState<string>('overview');

  useEffect(() => {
    if (!zoom) return;
    const close = (e: KeyboardEvent) => { if (e.key === 'Escape') setZoom(false); };
    document.addEventListener('keydown', close);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', close); document.body.style.overflow = previous; };
  }, [zoom]);

  if (!loading && !products.some((item) => item.slug === initialProduct.slug)) {
    return <div className="empty-state"><h1>Product not available</h1><Link className="btn btn-dark" href="/shop/">Explore the current collection</Link></div>;
  }
  const addSelected = () => { for (let i = 0; i < quantity; i++) add(p); };
  const name = p.name.replace('Prakruthi Aqua ', '');
  const ids = tabs.map(([id]) => id as string);

  return (
    <>
      <div className="pdp">
        <div className="pdp-gallery">
          <div className="pdp-stage">
            <span className="chip">{p.category}</span>
            <img src={p.image} alt={p.name} fetchPriority="high" />
            <button className="pdp-zoom" onClick={() => setZoom(true)} aria-label={`Enlarge image of ${p.name}`}><Expand size={16} /> View larger</button>
          </div>
          <div className="pdp-perks">
            <span><Truck size={18} strokeWidth={1.6} /> Ships across India</span>
            <span><ShieldCheck size={18} strokeWidth={1.6} /> Quality checked</span>
            <span><Headphones size={18} strokeWidth={1.6} /> Expert guidance</span>
          </div>
        </div>

        <div className="pdp-info">
          <p className="eyebrow"><span className="dot" />Prakruthi Aqua · {p.category}</p>
          <h1>{name}</h1>
          <div className="pdp-price"><span>{money(p.price)}</span><small>Catalog price · INR</small></div>
          <p className="pdp-desc">{description(p)}</p>
          <p className="notice"><Info size={15} /> Our team confirms available sizes and stock before payment.</p>

          <div className="pdp-buy">
            <div className="pdp-buy-row">
              <div className="qty">
                <button onClick={() => setQuantity((q) => q - 1)} disabled={quantity === 1} aria-label="Decrease quantity"><Minus size={15} /></button>
                <output aria-label="Quantity" aria-live="polite">{quantity}</output>
                <button onClick={() => setQuantity((q) => q + 1)} disabled={quantity === 20} aria-label="Increase quantity"><Plus size={15} /></button>
              </div>
              <button className="btn btn-dark btn-grow" onClick={addSelected}><ShoppingBag size={17} /> Add to cart</button>
              <WishlistButton product={p} detail />
            </div>
            <a className="btn btn-leaf btn-block btn-lg" href={`/checkout/?product=${encodeURIComponent(p.slug)}&quantity=${quantity}`}>Order now <ArrowUpRight size={18} /></a>
            <p className="fine">Submit an order request and our team will confirm. No online payment is collected here.</p>
          </div>

          <div className="accordions">
            <details open>
              <summary>Product information <ChevronDown size={16} /></summary>
              <dl>
                <div><dt>Brand</dt><dd>Prakruthi Aqua</dd></div>
                <div><dt>Category</dt><dd><Link href={`/shop/?category=${encodeURIComponent(p.category)}`}>{p.category} <ArrowUpRight size={12} /></Link></dd></div>
                <div><dt>Sizes &amp; availability</dt><dd>Confirmed by our team</dd></div>
              </dl>
            </details>
            <details>
              <summary>Need help choosing? <ChevronDown size={16} /></summary>
              <p>Tell us about the fish, plants or birds in your care and we’ll help you find the right product. Call <a href="tel:+918904373735">+91 89043 73735</a> or <Link href="/contact/">send us a message</Link>.</p>
            </details>
          </div>

          <Link href="/contact/" className="pdp-help"><MessageCircle size={20} strokeWidth={1.6} /><span><b>Not sure it’s right for your tank?</b><small>Ask our team — we’re happy to help.</small></span><ArrowUpRight size={18} /></Link>
        </div>
      </div>

      <section className="pdp-tabs-wrap">
        <div className="pdp-tabs" role="tablist" aria-label="Product details">
          {tabs.map(([id, label]) => (
            <button key={id} id={`tab-${id}`} role="tab" aria-selected={tab === id} aria-controls="product-info-panel" tabIndex={tab === id ? 0 : -1} onClick={() => setTab(id)}
              onKeyDown={(e) => {
                if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) {
                  e.preventDefault();
                  const i = ids.indexOf(tab);
                  const next = e.key === 'Home' ? 0 : e.key === 'End' ? 2 : (i + (e.key === 'ArrowRight' ? 1 : 2)) % 3;
                  setTab(ids[next]);
                  document.getElementById(`tab-${ids[next]}`)?.focus();
                }
              }}>{label}</button>
          ))}
        </div>
        <div id="product-info-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} tabIndex={0} className="pdp-panel">
          {tab === 'overview' ? <><h2>Meet {name}.</h2><p>{description(p)} Refer to the product label for ingredients, pack information and detailed directions. Contact us if you need help choosing.</p></>
            : tab === 'directions' ? <><h2>Care for your little world.</h2><p>Follow the product label for directions, dosage, storage and precautions. Check suitability for your specific setup before use. If you’re unsure, contact our team rather than guessing a dose or mixing treatments.</p></>
              : <><h2>From our shelves to your door.</h2><p>Submit an order request through checkout. Our team confirms available sizes, stock, shipping charges, delivery and payment instructions. Your order starts as pending and unpaid. Adding to your cart alone doesn’t place an order or reserve stock.</p></>}
          <a className="link-arrow" href={tab === 'directions' ? '/contact/' : p.url || `/checkout/?product=${encodeURIComponent(p.slug)}`} target={tab === 'directions' ? undefined : '_blank'} rel={tab === 'directions' ? undefined : 'noreferrer'}>
            {tab === 'directions' ? 'Talk to our team' : p.url ? 'View official product listing' : 'Order this product'} <ArrowUpRight size={16} />
          </a>
        </div>
      </section>

      {zoom && (
        <div className="overlay overlay-center" onClick={() => setZoom(false)}>
          <div role="dialog" aria-modal="true" aria-label={`${p.name} product image`} className="zoom" onClick={(e) => e.stopPropagation()}>
            <button autoFocus className="icon-btn zoom-close" onClick={() => setZoom(false)} aria-label="Close enlarged image"><X size={22} /></button>
            <img src={p.image} alt={p.name} />
            <p>{p.name}</p>
          </div>
        </div>
      )}
    </>
  );
}
