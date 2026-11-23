'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const key = 'prakruthi-brand-intro-v1';
export function BrandLoader() {
  const pathname = usePathname();
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return null;
  return <PublicBrandLoader />;
}

function PublicBrandLoader() {
  const [visible, setVisible] = useState(true);
  const video = useRef<HTMLVideoElement>(null);
  const skip = useRef<HTMLButtonElement>(null);
  const done = () => {
    setVisible(false);
    try { sessionStorage.setItem(key, 'seen'); } catch {}
  };
  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem(key) === 'seen'; } catch {}
    if (seen || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { done(); return; }
    const previousFocus = document.activeElement as HTMLElement | null;
    skip.current?.focus();
    const timeout = window.setTimeout(done, 10000);
    video.current?.play().catch(done);
    return () => { window.clearTimeout(timeout); previousFocus?.focus(); };
  }, []);
  useEffect(() => {
    if (!visible) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const escape = (e: KeyboardEvent) => { if(e.key === 'Escape') done(); if(e.key === 'Tab') { e.preventDefault(); skip.current?.focus(); } };
    document.addEventListener('keydown', escape);
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', escape); };
  }, [visible]);
  if (!visible) return null;
  return <div className="brand-loader" role="dialog" aria-modal="true" aria-label="Prakruthi Aqua welcome video">
    <video ref={video} autoPlay muted playsInline preload="auto" onEnded={done} onError={done} aria-hidden="true"><source src="/videos/brand-loading.mp4" type="video/mp4" /></video>
    <div className="brand-loader-bottom"><span role="status">Welcome to Prakruthi Aqua</span><button ref={skip} onClick={done}>Skip intro →</button></div>
  </div>;
}
