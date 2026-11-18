'use client';
// Signed-in customer's order history: status tracker, items, payment and invoice download.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, FileDown, Lock, MessageCircle, Package, ShoppingBag, UserPlus, UserRound, XCircle } from 'lucide-react';
import { useAuthPopup } from './auth-popup';
import { useStorefront } from './storefront-data';
import { money } from '@/lib/catalog';
import { openInvoice } from '@/lib/invoice';
import type { Order } from '@/lib/admin-data';

const STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'] as const;
const STEP_LABEL: Record<string, string> = { pending: 'Placed', confirmed: 'Confirmed', processing: 'Packing', shipped: 'Shipped', delivered: 'Delivered' };
const PAY_LABEL: Record<string, string> = { paid: 'Paid', pending: 'Payment pending', unpaid: 'Payment due', failed: 'Payment failed', refunded: 'Refunded' };

export default function MyOrders() {
  const { user, ready, open } = useAuthPopup();
  const { products } = useStorefront();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    let alive = true;
    fetch('/api/orders/', { cache: 'no-store' })
      .then(async (r) => { const d = await r.json().catch(() => ({})); if (!r.ok) throw Error(d?.error || 'Unable to load your orders.'); return d; })
      .then((d) => { if (alive) setOrders(d.orders as Order[]); })
      .catch((e) => { if (alive) { setError(e.message); setOrders([]); } });
    return () => { alive = false; };
  }, [user]);

  if (!ready || (user && orders === null)) return <div className="orders-loading"><span className="orders-spinner" />Loading your orders…</div>;

  if (!user) return (
    <div className="confirm checkout-gate">
      <span className="confirm-icon"><Lock size={30} /></span>
      <p className="eyebrow"><span className="dot" />Your orders</p>
      <h1>Sign in to see <em>your orders.</em></h1>
      <p className="muted">Track your orders, payments and download invoices from your Prakruthi Aqua account.</p>
      <div className="checkout-gate-actions">
        <button className="btn btn-dark btn-lg" onClick={() => open({ mode: 'signin', next: '/orders/' })}><UserRound size={17} /> Sign in</button>
        <button className="btn btn-outline btn-lg" onClick={() => open({ mode: 'register', next: '/orders/' })}><UserPlus size={17} /> Create account</button>
      </div>
    </div>
  );

  if (error) return <p className="alert alert-error" role="alert">{error}</p>;

  if (!orders?.length) return (
    <div className="empty-state">
      <span className="empty-icon"><ShoppingBag size={28} strokeWidth={1.5} /></span>
      <h2>No orders yet.</h2>
      <p>When you place an order, you’ll be able to track it here.</p>
      <Link className="btn btn-dark" href="/shop/">Start shopping <ArrowRight size={16} /></Link>
    </div>
  );

  return (
    <div className="orders-list">
      <p className="muted orders-count">{orders.length} {orders.length === 1 ? 'order' : 'orders'} · signed in as {user.email}</p>
      {orders.map((o) => {
        const cancelled = o.status === 'cancelled';
        const reached = STEPS.indexOf(o.status as (typeof STEPS)[number]);
        const units = o.items.reduce((s, i) => s + i.quantity, 0);
        const help = `https://wa.me/918904373735?text=${encodeURIComponent(`Hi Prakruthi Aqua, I have a question about my order ${o.order_number}.`)}`;
        return (
          <article className="order-card" key={o.id}>
            <header className="order-card-head">
              <div>
                <span className="order-card-no">{o.order_number}</span>
                <span className="order-card-date">{new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} · {units} {units === 1 ? 'item' : 'items'}</span>
              </div>
              <div className="order-card-tags">
                <span className={`order-pill is-${o.payment_status}`}>{PAY_LABEL[o.payment_status] || o.payment_status}</span>
                <strong>{money(o.total)}</strong>
              </div>
            </header>

            {cancelled
              ? <p className="order-cancelled"><XCircle size={17} /> This order was cancelled. If you were charged, the refund is processed to your original payment method.</p>
              : (
                <ol className="order-track" aria-label={`Order status: ${STEP_LABEL[o.status] || o.status}`}>
                  {STEPS.map((step, i) => (
                    <li key={step} className={i < reached ? 'is-done' : i === reached ? 'is-current' : ''}>
                      <span className="order-track-dot">{i <= reached ? <Check size={13} strokeWidth={3} /> : i + 1}</span>
                      <span className="order-track-label">{STEP_LABEL[step]}</span>
                    </li>
                  ))}
                </ol>
              )}

            <div className="order-card-body">
              <ul className="order-items">
                {o.items.map((i) => {
                  const p = products.find((x) => x.slug === i.slug);
                  return (
                    <li key={i.slug}>
                      <span className="thumb">{p ? <img src={p.image} alt="" /> : <Package size={20} />}</span>
                      <span className="order-item-name"><b>{i.name.replace('Prakruthi Aqua ', '')}</b><small>{money(i.price)} × {i.quantity}</small></span>
                      <span className="order-item-total">{money(i.price * i.quantity)}</span>
                    </li>
                  );
                })}
              </ul>
              <aside className="order-meta">
                <div><h4>Deliver to</h4><p>{o.customer_name}<br />{o.address}<br />{o.phone}</p></div>
                <div><h4>Payment</h4><p>{o.payment_method === 'razorpay' ? 'Online · Razorpay' : 'Confirmed by our team'}{o.payment_mode ? ` · ${o.payment_mode.toUpperCase()}` : ''}{o.paid_at ? <><br />Paid on {new Date(o.paid_at).toLocaleDateString('en-IN')}</> : null}</p></div>
              </aside>
            </div>

            <footer className="order-card-foot">
              <button className="btn btn-dark" onClick={() => openInvoice(o)}><FileDown size={16} /> Download invoice</button>
              <a className="btn btn-outline" href={help} target="_blank" rel="noreferrer"><MessageCircle size={16} /> Need help?</a>
            </footer>
          </article>
        );
      })}
    </div>
  );
}
