'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, CheckCircle2, ShoppingBag, Lock, Check } from 'lucide-react';
import { useStorefront } from './storefront-data';
import { useBag } from './site';
import { money } from '@/lib/catalog';
import { supabase } from '@/lib/supabase';
import { readDemo, writeDemo, type Order, type OrderItem } from '@/lib/admin-data';

export default function Checkout() {
  const params = useSearchParams();
  const { products, loading, demo } = useStorefront();
  const { items, clear } = useBag();
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [confirmation, setConfirmation] = useState('');
  const direct = products.find((p) => p.slug === params.get('product'));
  const qty = Math.min(20, Math.max(1, Number(params.get('quantity')) || 1));
  const selected = direct ? [{ slug: direct.slug, quantity: Math.floor(qty) }] : items;
  const orderItems: OrderItem[] = selected.flatMap((i) => {
    const p = products.find((p) => p.slug === i.slug);
    return p ? [{ slug: p.slug, name: p.name, quantity: i.quantity, price: p.price }] : [];
  });
  const total = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const f = new FormData(e.currentTarget);
    if (f.get('website')) return;
    const customer = { name: String(f.get('name')).trim(), email: String(f.get('email')).trim(), phone: String(f.get('phone')).trim(), address: String(f.get('address')).trim(), notes: String(f.get('notes')).trim() };
    setBusy(true);
    try {
      if (demo) {
        const data = readDemo();
        const id = crypto.randomUUID();
        const number = `DEMO-${Date.now().toString().slice(-7)}`;
        const order: Order = { id, order_number: number, created_at: new Date().toISOString(), customer_name: customer.name, email: customer.email, phone: customer.phone, address: customer.address, notes: customer.notes, status: 'pending', payment_status: 'unpaid', total, items: orderItems, source: 'demo-checkout' };
        writeDemo({ ...data, orders: [order, ...data.orders] });
        setConfirmation(number);
      } else {
        if (!supabase) throw Error('Online ordering is not connected yet. Please contact our team to place your order.');
        const { data, error } = await supabase.rpc('prakruthi_place_order', { p_customer: customer, p_items: orderItems.map((i) => ({ slug: i.slug, quantity: i.quantity })) });
        if (error) throw error;
        setConfirmation(String(data.order_number));
      }
      if (!direct) clear();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to submit your order. Please try again or contact us.');
    } finally { setBusy(false); }
  }

  if (loading) return <div className="loading">Loading your order…</div>;

  if (confirmation) return (
    <main id="main" className="section section-paper">
      <div className="container"><div className="confirm">
        <span className="confirm-icon"><CheckCircle2 size={34} /></span>
        <p className="eyebrow">{demo ? 'Demo order saved locally' : 'Order request received'}</p>
        <h1>Thank you for your order.</h1>
        <p className="confirm-number">{confirmation}</p>
        <p className="muted">{demo ? 'This is a preview order. It is not sent to the business.' : 'Our team will confirm availability, shipping charges and payment instructions using the contact details you provided. No payment has been collected.'}</p>
        <Link href="/shop/" className="btn btn-dark btn-lg">Continue shopping <ArrowRight size={16} /></Link>
      </div></div>
    </main>
  );

  if (!orderItems.length) return (
    <main id="main" className="section section-paper">
      <div className="container"><div className="confirm">
        <span className="confirm-icon confirm-icon-muted"><ShoppingBag size={30} /></span>
        <h1>Your cart is empty.</h1>
        <p className="muted">Add products before placing an order.</p>
        <Link href="/shop/" className="btn btn-dark btn-lg">Explore the shop <ArrowRight size={16} /></Link>
      </div></div>
    </main>
  );

  return (
    <main id="main" className="section section-paper">
      <div className="container">
        <div className="page-head">
          <p className="eyebrow"><span className="dot" />Checkout</p>
          <h1>Almost <em>there.</em></h1>
          <p className="muted">Submit your order request. Our team confirms availability, shipping and payment.</p>
        </div>
        <div className="checkout-grid">
          <form className="form-card" onSubmit={submit}>
            <h2>Your details</h2>
            <div className="fields">
              <label>Full name *<input name="name" required maxLength={100} autoComplete="name" /></label>
              <label>Email address *<input name="email" type="email" required maxLength={200} autoComplete="email" /></label>
              <label>Phone number *<input name="phone" type="tel" required maxLength={30} autoComplete="tel" /></label>
              <label className="full">Delivery address *<textarea name="address" required minLength={10} maxLength={1000} rows={3} autoComplete="street-address" /></label>
              <label className="full">Order notes<textarea name="notes" maxLength={2000} rows={3} /></label>
              <label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
            </div>
            <label className="check check-terms">
              <input required type="checkbox" />
              <span className="check-box"><Check size={13} strokeWidth={3} /></span>
              {demo ? <span>I understand this is a local demo order. It will not be sent to the business.</span> : <span>I agree to the <Link href="/terms-and-conditions/">Terms &amp; Conditions</Link> and have read the <Link href="/privacy-policy/">Privacy Policy</Link>.</span>}
            </label>
            {!supabase && !demo && <p className="alert alert-error">Online orders need a connected Supabase project. You can still contact our team to place an order.</p>}
            {error && <p className="alert alert-error" role="alert">{error}</p>}
            <button className="btn btn-dark btn-lg btn-block" disabled={busy || (!supabase && !demo)}>{busy ? 'Submitting…' : demo ? 'Save demo order' : 'Submit order request'} <ArrowRight size={16} /></button>
          </form>
          <aside className="summary">
            <h2>Order summary</h2>
            {orderItems.map((i) => {
              const p = products.find((x) => x.slug === i.slug);
              return (
                <div className="summary-line" key={i.slug}>
                  <span className="thumb">{p && <img src={p.image} alt="" />}<i>{i.quantity}</i></span>
                  <span className="summary-name">{i.name}</span>
                  <b>{money(i.price * i.quantity)}</b>
                </div>
              );
            })}
            <div className="summary-total"><span>Subtotal</span><b>{money(total)}</b></div>
            <p className="fine"><Lock size={13} /> Shipping and the final payable amount are confirmed by our team before payment. No payment is collected here.</p>
            <Link className="link-arrow" href="/contact/">Need help? Contact us</Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
