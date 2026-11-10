'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Leaf, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DealerPortalCard } from './dealer-portal';

const AuthPopupContext = createContext({ open: () => {} });
export const useAuthPopup = () => useContext(AuthPopupContext);

export function AuthPopupProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<'signin' | 'register' | 'reset'>('signin');
  const [user, setUser] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const open = () => { trigger.current = document.activeElement as HTMLElement; setMode('signin'); setMessage(''); setError(''); setShowPassword(false); setVisible(true); };
  const close = () => { setVisible(false); trigger.current?.focus(); };

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.auth.getUser().then(({ data }) => { if (active) setUser(data.user); });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => { active = false; data.subscription.unsubscribe(); };
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

  function switchMode(next: typeof mode) { setMode(next); setError(''); setMessage(''); setShowPassword(false); }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(''); setMessage('');
    if (!supabase) { setError('Account access is being set up. Please contact us for help with your order.'); return; }
    const data = new FormData(e.currentTarget);
    const email = String(data.get('email') || '').trim();
    const password = String(data.get('password') || '');
    if (mode === 'register' && password !== data.get('confirmPassword')) { setError('Passwords do not match.'); return; }
    setBusy(true);
    try {
      if (mode === 'register') {
        const { data: result, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: String(data.get('name') || '').trim() }, emailRedirectTo: location.origin + '/account/' } });
        if (error) throw error;
        setMessage(result.session ? 'Your account is ready. Welcome to Prakruthi Aqua.' : 'Check your email for the confirmation link. If you already have an account, use Sign In.');
      } else if (mode === 'reset') {
        // Email link uses the existing account callback, without exposing a password reset token.
        const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false, emailRedirectTo: location.origin + '/account/' } });
        if (error) throw error;
        setMessage('If your account is eligible, you’ll receive a secure sign-in link by email.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage('You’re signed in. Welcome back.');
      }
    } catch { setError(mode === 'signin' ? 'Unable to sign in. Check your email and password, and confirm your email if needed.' : 'Unable to complete your request. Please try again shortly.'); }
    finally { setBusy(false); }
  }

  return <AuthPopupContext.Provider value={{ open }}>{children}{visible && (
    <div className="auth-popup-overlay" onClick={e => { if (e.target === e.currentTarget) close(); }}>
      <div className="auth-popup" role="dialog" aria-modal="true" aria-labelledby="auth-popup-title" ref={panel} tabIndex={-1}>
        <button className="auth-popup-close icon-btn" aria-label="Close account popup" onClick={close}><X size={21} /></button>
        <aside className="auth-popup-visual">
          <img src="/images/plants.jpg" alt="" />
          <div><img className="auth-popup-logo" src="/images/prakruthi-icon.svg" alt="Prakruthi Aqua" /><span className="eyebrow">A little care. A world of life.</span><h2>Your aquatic<br /><em>journey starts here.</em></h2>{!user && mode !== 'reset' && <DealerPortalCard compact />}<span className="auth-popup-note"><Leaf size={16} /> Thoughtfully made in Bengaluru</span></div>
        </aside>
        <div className="auth-popup-main">
          {user ? <div className="auth-popup-welcome"><CheckCircle2 size={38} /><p className="eyebrow">Your account</p><h1 id="auth-popup-title">Welcome back.</h1><p className="muted">{user.user_metadata.full_name || user.email}</p><p className="fine">Signed in as {user.email}</p><button className="btn btn-leaf btn-block" onClick={close}>Continue shopping <ArrowRight size={16} /></button><button className="btn btn-outline btn-block" disabled={busy} onClick={async () => { if (!supabase) return; setBusy(true); const { error } = await supabase.auth.signOut(); setBusy(false); if (error) setError('Unable to sign out. Please try again.'); else { setUser(null); setMessage(''); } }}>Sign out</button>{error && <p role="alert" className="auth-popup-error">{error}</p>}</div> : <>
            <p className="eyebrow"><span className="dot" /> Prakruthi Aqua members</p>
            <h1 id="auth-popup-title">{mode === 'register' ? 'Create an account.' : mode === 'reset' ? 'Email sign-in link.' : 'Welcome back.'}</h1>
            <p className="muted">{mode === 'register' ? 'Join our community of aquarium lovers.' : mode === 'reset' ? 'Get a secure link to sign in without your password.' : 'Sign in to your Prakruthi Aqua account.'}</p>
            {mode !== 'reset' && <div className="auth-popup-dealer-mobile"><DealerPortalCard compact /></div>}
            <div className="auth-popup-tabs" role="group" aria-label="Account access"><button disabled={busy} aria-pressed={mode !== 'register'} onClick={() => switchMode('signin')}>Sign In</button><button disabled={busy} aria-pressed={mode === 'register'} onClick={() => switchMode('register')}>Register</button></div>
            <form className="auth-form" key={mode} onSubmit={submit}>
              <fieldset disabled={busy}>
                {mode === 'register' && <label>Full name<input name="name" autoComplete="name" required maxLength={100} placeholder="Your full name" /></label>}
                <label>Email address<input name="email" type="email" autoComplete="email" required maxLength={200} placeholder="you@example.com" /></label>
                {mode !== 'reset' && <label>Password<span className="auth-popup-password"><input name="password" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} minLength={mode === 'register' ? 8 : 1} required placeholder={mode === 'register' ? 'At least 8 characters' : 'Enter your password'} /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>}
                {mode === 'register' && <label>Confirm password<input name="confirmPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={8} required placeholder="Repeat your password" /></label>}
                {mode === 'signin' && <button type="button" className="auth-popup-help" onClick={() => switchMode('reset')}>Forgot password? Email me a sign-in link</button>}
                <button className="btn btn-dark btn-block" type="submit">{busy ? 'Please wait…' : mode === 'register' ? 'Create account' : mode === 'reset' ? 'Send sign-in link' : 'Sign In'}<ArrowRight size={16} /></button>
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
