'use client';
import { useEffect } from 'react';

/**
 * Fades `[data-reveal]` elements in as they scroll into view (content stays visible without JS),
 * and gives `[data-tilt]` cards a subtle 3D tilt with a moving glare on mouse hover.
 */
export default function Reveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    const root = document.documentElement;
    const items = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach((el) => {
      // Anything already on screen shows immediately, without a flash.
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) el.classList.add('is-in', 'is-static');
      else io.observe(el);
    });
    root.classList.add('js-reveal');

    const tilts = Array.from(document.querySelectorAll<HTMLElement>('[data-tilt]'));
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const el = e.currentTarget as HTMLElement;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--ry', `${((x - 0.5) * 10).toFixed(2)}deg`);
      el.style.setProperty('--rx', `${((0.5 - y) * 10).toFixed(2)}deg`);
      el.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`);
      el.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`);
    };
    const leave = (e: PointerEvent) => {
      const el = e.currentTarget as HTMLElement;
      el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg');
    };
    tilts.forEach((el) => { el.addEventListener('pointermove', move); el.addEventListener('pointerleave', leave); });

    return () => {
      io.disconnect(); root.classList.remove('js-reveal');
      tilts.forEach((el) => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); });
    };
  }, []);
  return null;
}
