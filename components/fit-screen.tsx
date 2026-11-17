'use client';
import { useEffect, useRef } from 'react';

/**
 * Drop inside a hero section. Measures where the section starts (below the site header) and the
 * height of the mobile bottom tab bar, and exposes them as --fit-top / --fit-bottom on the section,
 * so CSS can size the hero to fill exactly one screen.
 */
export default function FitScreen() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const section = ref.current?.parentElement;
    if (!section) return;
    const update = () => {
      const top = Math.max(0, Math.round(section.getBoundingClientRect().top + window.scrollY));
      const bar = document.querySelector<HTMLElement>('.tabbar');
      const bottom = bar && getComputedStyle(bar).display !== 'none' ? bar.offsetHeight : 0;
      section.style.setProperty('--fit-top', `${top}px`);
      section.style.setProperty('--fit-bottom', `${bottom}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(document.body);
    window.addEventListener('resize', update);
    return () => { ro.disconnect(); window.removeEventListener('resize', update); };
  }, []);
  return <span ref={ref} hidden />;
}
