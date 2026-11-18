'use client';
// Header profile button. Signed out: opens Sign in / Sign up. Signed in: dropdown with My orders + Logout.
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, LogOut, Package, UserRound } from 'lucide-react';
import { useAuthPopup } from './auth-popup';

export default function AccountMenu() {
  const { user, open, signOut } = useAuthPopup();
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!show) return;
    const outside = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setShow(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setShow(false); };
    document.addEventListener('mousedown', outside);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', outside); document.removeEventListener('keydown', esc); };
  }, [show]);

  if (!user) {
    return (
      <button className="header-account" onClick={() => open()} aria-label="Sign in or sign up">
        <UserRound size={17} /><span className="header-account-text">Sign in <i>/</i> Sign up</span>
      </button>
    );
  }

  const first = user.name.split(' ')[0] || 'Account';
  return (
    <div className="account-menu" ref={box}>
      <button className="header-account is-signed-in" onClick={() => setShow((v) => !v)} aria-haspopup="menu" aria-expanded={show} aria-label={`Account menu for ${user.name}`}>
        <span className="header-avatar" aria-hidden="true">{first[0]?.toUpperCase()}</span>
        <span className="header-account-text">{first}</span>
        <ChevronDown size={14} className="account-menu-caret" />
      </button>
      {show && (
        <div className="account-menu-panel" role="menu">
          <div className="account-menu-head">
            <span className="header-avatar" aria-hidden="true">{first[0]?.toUpperCase()}</span>
            <div><b>{user.name}</b><small>{user.email}</small></div>
          </div>
          <Link role="menuitem" href="/orders/" onClick={() => setShow(false)}><Package size={17} /> My orders</Link>
          <button role="menuitem" disabled={busy} onClick={async () => { setBusy(true); await signOut(); setBusy(false); setShow(false); }}>
            <LogOut size={17} /> {busy ? 'Logging out…' : 'Logout'}
          </button>
        </div>
      )}
    </div>
  );
}
