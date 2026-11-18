'use client';
import { useCallback, useEffect, useState } from 'react';
import DeliveryLocation from './delivery-location';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, CheckCircle2, ShoppingBag, Lock, Check, UserRound, UserPlus, CreditCard, Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import { useStorefront } from './storefront-data';
import { useAuthPopup } from './auth-popup';
import { useBag } from './site';
import { money } from '@/lib/catalog';
import { supabase } from '@/lib/supabase';
import { readDemo, writeDemo, type Order, type OrderItem } from '@/lib/admin-data';
import { onlinePaymentsEnabled, readPending, savePending, clearPending, callPayments, loadRazorpay, openRazorpay, type PendingPayment, type CreateResult, type PaymentStatus, type RazorpaySuccess } from '@/lib/razorpay-client';

type Phase = 'form' | 'starting' | 'paying' | 'verifying' | 'checking' | 'unpaid';
type Confirmation = { number: string; total: number; paid: boolean };

export default function Checkout() {
  const params = useSearchParams();
  const { products, loading, demo } = useStorefront();
  const { items, clear } = useBag();
  const { user, ready, open: openAccount } = useAuthPopup();
  const needsAccount = !demo;
  const online = onlinePaymentsEnabled && !demo;
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [phase, setPhase] = useState<Phase>('form'), [pending, setPending] = useState<PendingPayment | null>(null), [note, setNote] = useState('');
  const direct = products.find((p) => p.slug === params.get('product'));
  const qty = Math.min(20, Math.max(1, Number(params.get('quantity')) || 1));
  const selected = direct ? [{ slug: direct.slug, quantity: Math.floor(qty) }] : items;
  const orderItems: OrderItem[] = selected.flatMap((i) => {
    const p = products.find((p) => p.slug === i.slug);
    return p ? [{ slug: p.slug, name: p.name, quantity: i.quantity, price: p.price }] : [];
  });
  const total = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);

  // ---------- Razorpay payment flow ----------
  const finish = useCallback((p: PendingPayment) => {
    clearPending(); setPending(null); setPhase('form'); setError('');
    if (!p.direct) clear();
    setConfirmation({ number: p.order_number, total: p.total, paid: true });
  }, [clear]);

  const checkStatus = useCallback(async (p: PendingPayment) => {
    setPhase('checking');
    try {
      const res = await callPayments<{ status: PaymentStatus }>({ action: 'status', order_id: p.order_id });
      if (res.status === 'paid') return finish(p);
      setNote(res.status === 'failed' ? 'Your last payment attempt did not go through. No money was taken for it.' : 'Your payment was not completed. Your order is saved — you can pay whenever you’re ready.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'We couldn’t check your payment right now.');
    }
    setPhase('unpaid');
  }, [finish]);

  const verify = useCallback(async (p: PendingPayment, r: RazorpaySuccess) => {
    setPhase('verifying'); setError('');
    try {
      const res = await callPayments<{ status: PaymentStatus }>({ action: 'verify', order_id: p.order_id, ...r });
      if (res.status === 'paid') return finish(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'We couldn’t confirm your payment yet.');
    }
    // Fall back to asking Razorpay directly — the payment may still have succeeded.
    await checkStatus(p);
  }, [finish, checkStatus]);

  const startPayment = useCallback(async (p: PendingPayment) => {
    setPhase('starting'); setError(''); setNote('');
    try {
      const order = await callPayments<CreateResult>({ action: 'create', order_id: p.order_id });
      if (order.status === 'paid') return finish(p);
      await loadRazorpay();
      setPhase('paying');
      openRazorpay(order, {
        onSuccess: (r) => { void verify(p, r); },
        onDismiss: () => { setPhase((cur) => (cur === 'paying' ? 'unpaid' : cur)); setNote('Payment was cancelled. Your order is saved — you can pay whenever you’re ready.'); },
        onFailed: (message) => setError(message),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start the payment. Please try again.');
      setPhase('unpaid');
    }
  }, [finish, verify]);

  // After a refresh (or returning later), re-check any unfinished payment with Razorpay.
  useEffect(() => {
    if (!online || !ready || !user || confirmation) return;
    const p = readPending();
    if (!p) return;
    setPending(p);
    void checkStatus(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [online, ready, user]);

  // Warn before leaving while money may be moving.
  useEffect(() => {
    if (phase !== 'verifying' && phase !== 'starting') return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [phase]);

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
        setConfirmation({ number, total, paid: false });
      } else {
        const res = await fetch('/api/orders/', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customer, items: orderItems.map((i) => ({ slug: i.slug, quantity: i.quantity })), payment_method: online ? 'razorpay' : 'offline' }),
        }).catch(() => { throw Error('We couldn’t reach our server. Check your connection and try again.'); });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw Error(data?.error || 'Unable to place your order. Please try again.');
        if (online) {
          if (!data?.id) throw Error('Online payment needs the latest database update. Please contact us to complete your order.');
          const p: PendingPayment = { order_id: String(data.id), order_number: String(data.order_number), total: Number(data.total), direct: !!direct, created_at: Date.now() };
          savePending(p); setPending(p);
          setBusy(false);
          await startPayment(p);
          return;
        }
        setConfirmation({ number: String(data.order_number), total, paid: false });
      }
      if (!direct) clear();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to submit your order. Please try again or contact us.');
    } finally { setBusy(false); }
  }

  if (loading || (needsAccount && !ready)) return <div className="loading">Loading your order…</div>;

  if (needsAccount && !user && !confirmation) {
    const here = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/checkout/';
    const count = orderItems.reduce((s, i) => s + i.quantity, 0);
    return (
      <main id="main" className="section section-paper">
        <div className="container"><div className="confirm checkout-gate">
          <span className="confirm-icon"><Lock size={30} /></span>
          <p className="eyebrow"><span className="dot" />Secure checkout</p>
          <h1>Sign in to <em>check out.</em></h1>
          <p className="muted">Please sign in or create a free account to place your order request. We’ll bring you straight back here{count ? ` with your ${count} ${count === 1 ? 'item' : 'items'}` : ''}.</p>
          <div className="checkout-gate-actions">
            <button className="btn btn-dark btn-lg" onClick={() => openAccount({ mode: 'signin', next: here })}><UserRound size={17} /> Sign in</button>
            <button className="btn btn-outline btn-lg" onClick={() => openAccount({ mode: 'register', next: here })}><UserPlus size={17} /> Create account</button>
          </div>
          {orderItems.length > 0 && <p className="fine"><ShoppingBag size={13} /> Order total so far: <b>{money(total)}</b></p>}
        </div></div>
      </main>
    );
  }

  if (confirmation) return (
    <main id="main" className="section section-paper">
      <div className="container"><div className="confirm">
        <span className="confirm-icon"><CheckCircle2 size={34} /></span>
        <p className="eyebrow">{demo ? 'Demo order saved locally' : confirmation.paid ? 'Payment successful' : 'Order request received'}</p>
        <h1>Thank you for your order.</h1>
        <p className="confirm-number">{confirmation.number}</p>
        {confirmation.paid && <p className="pay-paid"><CheckCircle2 size={16} /> {money(confirmation.total)} paid securely via Razorpay</p>}
        <p className="muted">{demo ? 'This is a preview order. It is not sent to the business.' : confirmation.paid ? 'We’ve received your payment. Our team will now pack your order in Bengaluru and share dispatch details with you.' : 'Our team will confirm availability, shipping charges and payment instructions using the contact details you provided. No payment has been collected.'}</p>
        <div className="checkout-gate-actions">{!demo && <Link href="/orders/" className="btn btn-dark btn-lg">View my orders <ArrowRight size={16} /></Link>}<Link href="/shop/" className="btn btn-outline btn-lg">Continue shopping</Link></div>
      </div></div>
    </main>
  );

  if (phase === 'starting' || phase === 'verifying' || phase === 'checking') return (
    <main id="main" className="section section-paper">
      <div className="container"><div className="confirm pay-progress" role="status" aria-live="polite">
        <span className="confirm-icon"><Loader2 size={32} className="pay-spin" /></span>
        <p className="eyebrow"><span className="dot" />{phase === 'starting' ? 'Secure payment' : 'Please wait'}</p>
        <h1>{phase === 'starting' ? 'Opening secure payment…' : phase === 'verifying' ? 'Confirming your payment…' : 'Checking your payment…'}</h1>
        <p className="muted">{phase === 'checking' ? 'We’re checking with Razorpay whether your last payment went through.' : 'Please don’t close or refresh this page. This takes only a few seconds.'}</p>
        {pending && <p className="confirm-number">{pending.order_number}</p>}
      </div></div>
    </main>
  );

  if (phase === 'unpaid' && pending) return (
    <main id="main" className="section section-paper">
      <div className="container"><div className="confirm pay-retry">
        <span className="confirm-icon confirm-icon-muted"><AlertCircle size={32} /></span>
        <p className="eyebrow"><span className="dot" />Payment pending</p>
        <h1>Complete your <em>payment.</em></h1>
        <p className="confirm-number">{pending.order_number} · {money(pending.total)}</p>
        <p className="muted">{note || 'Your order is saved. Complete the payment to confirm it.'}</p>
        {error && <p className="alert alert-error" role="alert">{error}</p>}
        <div className="checkout-gate-actions">
          <button className="btn btn-dark btn-lg" onClick={() => void startPayment(pending)}><CreditCard size={17} /> Pay {money(pending.total)} now</button>
          <button className="btn btn-outline btn-lg" onClick={() => void checkStatus(pending)}><RotateCcw size={16} /> I’ve already paid — check again</button>
        </div>
        <button className="pay-new" onClick={() => { clearPending(); setPending(null); setPhase('form'); setError(''); setNote(''); }}>Start a new order instead</button>
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
          <p className="muted">{online ? 'Enter your delivery details and pay securely with UPI, card, net banking or wallet.' : 'Submit your order request. Our team confirms availability, shipping and payment.'}</p>
        </div>
        <div className="checkout-grid">
          <form className="form-card" onSubmit={submit}>
            <h2>Your details</h2>
            <div className="fields">
              <label>Full name *<input name="name" required maxLength={100} autoComplete="name" defaultValue={user?.name || ''} /></label>
              <label>Email address *<input name="email" type="email" required maxLength={200} autoComplete="email" defaultValue={user?.email || ''} /></label>
              <label>Phone number *<input name="phone" type="tel" required maxLength={30} autoComplete="tel" /></label>
              <DeliveryLocation />
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
            <button className="btn btn-dark btn-lg btn-block" disabled={busy || phase === 'paying' || (!supabase && !demo)}>
              {busy ? (online ? 'Preparing payment…' : 'Submitting…') : demo ? 'Save demo order' : online ? <><Lock size={16} /> Pay {money(total)} now</> : 'Submit order request'} {!online && <ArrowRight size={16} />}
            </button>
            {online && <p className="pay-methods"><CreditCard size={14} /> Secured by Razorpay · UPI · Cards · Net banking · Wallets</p>}
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
            {online
              ? <p className="fine"><Lock size={13} /> You pay {money(total)} securely through Razorpay. Your card or UPI details never touch our website.</p>
              : <p className="fine"><Lock size={13} /> Shipping and the final payable amount are confirmed by our team before payment. No payment is collected here.</p>}
            <Link className="link-arrow" href="/contact/">Need help? Contact us</Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
