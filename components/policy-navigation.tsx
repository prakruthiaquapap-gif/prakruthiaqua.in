'use client';
import { useEffect, useState } from 'react';

export default function PolicyNavigation({ sections }: { sections: { id: string; title: string }[] }) {
  const [active, setActive] = useState(sections[0]?.id);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length) setActive(visible[0].target.id);
    }, { rootMargin: '-140px 0px -55% 0px', threshold: 0 });
    sections.forEach((s) => { const el = document.getElementById(s.id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [sections]);
  return (
    <aside className="policy-toc">
      <p className="eyebrow">In this document</p>
      <nav aria-label="Policy contents">
        {sections.map((s, i) => (
          <a key={s.id} href={`#${s.id}`} aria-current={active === s.id ? 'location' : undefined} onClick={() => setActive(s.id)}>
            <span>{String(i + 1).padStart(2, '0')}</span>{s.title}
          </a>
        ))}
      </nav>
    </aside>
  );
}
