'use client';

// Website customer accounts. These are stored in the website's own table
// (public.prakruthi_website_customers via /api/auth), separate from dealer-portal logins,
// so the same email can register here even if it is already used on the dealer portal.
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Leaf, X, PhoneCall, MessageCircle } from 'lucide-react';
import { DealerPortalCard } from './dealer-portal';

export type CustomerUser = { id: string; name: string; email: string; phone: string };
type Mode = 'signin' | 'register' | 'reset';
type OpenOptions = { mode?: 'signin' | 'register'; next?: string; reason?: string };
type AuthContextValue = { open: (opts?: OpenOptions | React.SyntheticEvent) => void; user: CustomerUser | null; ready: boolean; requireAuth: (href: string) => boolean; signOut: () => Promise<void> };
const NEXT_KEY = 'prakruthi-auth-next';
const AuthPopupContext = createContext<AuthContextValue>({ open: () => {}, user: null, ready: false, requireAuth: () => true, signOut: async () => {} });
export const useAuthPopup = () => useContext(AuthPopupContext);

async function api<T>(path: string, body?: Record<string, unknown>): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : { cache: 'no-store' });
  } catch {
    throw Error('We couldn’t reach the account service. Check your internet connection and try again.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Error(data?.error || 'Something went wrong. Please try again.');
  return data as T;
}

export function AuthPopupProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<Mode>('signin');
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [ready, setReady] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLElement | null>(null);

  const open = (input?: OpenOptions | React.SyntheticEvent) => {
    const opts = input && !('nativeEvent' in input) ? input : undefined;
    trigger.current = document.activeElement as HTMLElement;
    try { if (opts?.next) localStorage.setItem(NEXT_KEY, opts.next); } catch {}
    setReason(opts?.reason || (opts?.next?.startsWith('/checkout') ? 'Sign in or create an account to place your order.' : ''));
    setMode(opts?.mode || 'signin'); setMessage(''); setError(''); setShowPassword(false); setVisible(true);
  };
  const requireAuth = (href: string) => {
    if (user) return true;
    open({ mode: 'signin', next: href });
    return false;
  };
  // After sign-in or registration, continue to the page that asked for an account (e.g. checkout).
  const continueNext = () => {
    let next = '';
    try { next = localStorage.getItem(NEXT_KEY) || ''; localStorage.removeItem(NEXT_KEY); } catch {}
    if (next.startsWith('/') && !next.startsWith('//')) { setVisible(false); window.location.assign(next); return true; }
    return false;
  };
  const close = () => {
    try { localStorage.removeItem(NEXT_KEY); } catch {}
    setVisible(false); trigger.current?.focus();
  };

  useEffect(() => {
    let active = true;
    api<{ user: CustomerUser | null }>('/api/auth/me/')
      .then((d) => { if (active) setUser(d.user); })
      .catch(() => {})
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!visible) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      if (e.key !== 'Tab') return;
      const controls = Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), [tabindex="0"]') ?? []);
      const first = controls[0], last = controls[controls.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || document.activeElement === panel.current)) { e.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', onKey); };
  }, [visible]);

  function switchMode(next: Mode) { setMode(next); setError(''); setMessage(''); setShowPassword(false); }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(''); setMessage('');
    const data = new FormData(e.currentTarget);
    const email = String(data.get('email') || '').trim();
    const password = String(data.get('password') || '');
    if (mode === 'register' && password !== data.get('confirmPassword')) { setError('Passwords do not match.'); return; }
    setBusy(true);
    try {
      const result = mode === 'register'
        ? await api<{ user: CustomerUser }>('/api/auth/register/', { name: String(data.get('name') || '').trim(), email, phone: String(data.get('phone') || '').trim(), password })
        : await api<{ user: CustomerUser }>('/api/auth/login/', { email, password });
      setUser(result.user);
      if (continueNext()) return;
      setMessage(mode === 'register' ? 'Your account is ready. Welcome to Prakruthi Aqua.' : 'You’re signed in. Welcome back.');
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(text);
      if (mode === 'register' && /already registered/i.test(text)) setMode('signin');
    } finally { setBusy(false); }
  }

  async function signOut() {
    setBusy(true);
    try { await api('/api/auth/logout/', {}); setUser(null); setMessage(''); setError(''); close(); window.location.replace('/'); }
    catch { setError('Unable to sign out. Please try again.'); }
    finally { setBusy(false); }
  }

  return <AuthPopupContext.Provider value={{ open, user, ready, requireAuth, signOut }}>{children}{visible && (
    <div className="auth-popup-overlay" onClick={e => { if (e.target === e.currentTarget) close(); }}>
      <div className="auth-popup" role="dialog" aria-modal="true" aria-labelledby="auth-popup-title" ref={panel} tabIndex={-1}>
        <button className="auth-popup-close icon-btn" aria-label="Close account popup" onClick={close}><X size={21} /></button>
        <aside className="auth-popup-visual">
          <img src="/images/plants.jpg" alt="" />
          <div><img className="auth-popup-logo" src="/images/prakruthi-icon.svg" alt="Prakruthi Aqua" /><span className="eyebrow">A little care. A world of life.</span><h2>Your aquatic<br /><em>journey starts here.</em></h2>{!user && mode !== 'reset' && <DealerPortalCard compact />}<span className="auth-popup-note"><Leaf size={16} /> Thoughtfully made in Bengaluru</span></div>
        </aside>
        <div className="auth-popup-main">
          {user ? (
            <div className="auth-popup-welcome">
              <CheckCircle2 size={38} />
              <p className="eyebrow">Your account</p>
              <h1 id="auth-popup-title">Welcome{message ? '' : ' back'}, {user.name.split(' ')[0]}.</h1>
              <p className="fine">Signed in as {user.email}</p>
              {message && <p className="alert" role="status">{message}</p>}
              <button className="btn btn-leaf btn-block" onClick={close}>Continue shopping <ArrowRight size={16} /></button>
              <button className="btn btn-outline btn-block" disabled={busy} onClick={() => void signOut()}>Sign out</button>
              {error && <p role="alert" className="auth-popup-error">{error}</p>}
            </div>
          ) : mode === 'reset' ? (
            <>
              <p className="eyebrow"><span className="dot" /> Account help</p>
              <h1 id="auth-popup-title">Forgot your password?</h1>
              <p className="muted">Contact our team and we’ll help you reset it quickly. Please message from the phone number or email you registered with.</p>
              <a className="btn btn-dark btn-block" href="https://wa.me/918904373735?text=Hi%20Prakruthi%20Aqua%2C%20I%20need%20help%20resetting%20my%20website%20account%20password." target="_blank" rel="noreferrer"><MessageCircle size={16} /> WhatsApp us</a>
              <a className="btn btn-outline btn-block" href="tel:+918904373735"><PhoneCall size={16} /> Call +91 89043 73735</a>
              <button type="button" className="auth-popup-help" onClick={() => switchMode('signin')}>← Back to sign in</button>
            </>
          ) : <>
            <p className="eyebrow"><span className="dot" /> Prakruthi Aqua customers</p>
            {reason && <p className="auth-popup-reason">{reason}</p>}
            <h1 id="auth-popup-title">{mode === 'register' ? 'Create an account.' : 'Welcome back.'}</h1>
            <p className="muted">{mode === 'register' ? 'Join our community of aquarium lovers. This website account is separate from the dealer portal.' : 'Sign in to your Prakruthi Aqua website account.'}</p>
            <div className="auth-popup-dealer-mobile"><DealerPortalCard compact /></div>
            <div className="auth-popup-tabs" role="group" aria-label="Account access"><button disabled={busy} aria-pressed={mode !== 'register'} onClick={() => switchMode('signin')}>Sign In</button><button disabled={busy} aria-pressed={mode === 'register'} onClick={() => switchMode('register')}>Register</button></div>
            <form className="auth-form" key={mode} onSubmit={submit}>
              <fieldset disabled={busy}>
                {mode === 'register' && <label>Full name<input name="name" autoComplete="name" required maxLength={100} placeholder="Your full name" /></label>}
                <label>Email address<input name="email" type="email" autoComplete="email" required maxLength={200} placeholder="you@example.com" /></label>
                {mode === 'register' && <label>Phone number <small>(optional)</small><input name="phone" type="tel" autoComplete="tel" maxLength={30} placeholder="+91 98765 43210" /></label>}
                <label>Password<span className="auth-popup-password"><input name="password" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} minLength={mode === 'register' ? 8 : 1} required placeholder={mode === 'register' ? 'At least 8 characters' : 'Enter your password'} /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
                {mode === 'register' && <label>Confirm password<input name="confirmPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={8} required placeholder="Repeat your password" /></label>}
                <button className="btn btn-dark btn-block" type="submit">{busy ? 'Please wait…' : mode === 'register' ? 'Create account' : 'Sign In'}<ArrowRight size={16} /></button>
              </fieldset>
            </form>
            {error && <p className="auth-popup-error" role="alert">{error}</p>}
            {message && <p className="alert" role="status">{message}</p>}
            {mode === 'register' && <p className="fine">By registering, you agree to our <a href="/terms-and-conditions/">Terms &amp; Conditions</a> and <a href="/privacy-policy/">Privacy Policy</a>.</p>}
          </>}
        </div>
      </div>
    </div>
  )}</AuthPopupContext.Provider>;
}
