'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Droplets, Fish, Sprout } from 'lucide-react';
import { Bubbles, Caustics } from './aquatic-fx';

const layers = [
  { depth: 0, zone: 'The surface', icon: Droplets, title: 'Water', accent: 'clear & balanced.', text: 'Everything begins with the water. Conditioners and cleaners keep it clear, safe and balanced — the quiet foundation every aquarium stands on.', image: '/images/water.jpg', category: 'Aquarium cleaners', tags: ['Water conditioner', 'Aquarium cleaner', 'Bio sponge'] },
  { depth: 6, zone: 'Mid-water', icon: Fish, title: 'Fish', accent: 'vibrant & active.', text: 'Nutrition and gentle health care for the life at the heart of your tank — pellets, freeze-dried favourites and dependable remedies.', image: '/images/aquarium.jpg', category: 'Fish foods', tags: ['Micro pellets', 'Blood worms', 'Fish medicines'] },
  { depth: 12, zone: 'The riverbed', icon: Sprout, title: 'Plants', accent: 'lush & rooted.', text: 'Down where the roots grow, plant nutrients and CO₂ keep your underwater garden green, steady and naturally beautiful.', image: '/images/plants.jpg', category: 'Plant fertilizers', tags: ['Macro nutrients', 'CO₂ cylinder', 'Plant care'] },
];

const shop = (c: string) => `/shop/?category=${encodeURIComponent(c)}`;

export default function DiveSection() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const panels = Array.from(el.querySelectorAll<HTMLElement>('.aqz-panel'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i)); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    panels.forEach((p) => io.observe(p));

    let frame = 0;
    const update = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / Math.max(total, 1)));
      el.style.setProperty('--p', p.toFixed(4));
      const meter = el.querySelector<HTMLElement>('.aqz-depth b');
      if (meter) meter.textContent = (p * 12).toFixed(1);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { io.disconnect(); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(frame); };
  }, []);

  return (
    <section ref={root} id="dive" className="aqz" data-active={active} aria-label="Dive into a healthy tank">
      <Caustics className="aqz-caustics" />
      <Bubbles count={18} className="aqz-bubbles" />
      <div className="container aqz-grid">
        <div className="aqz-sticky">
          <p className="aq-eyebrow"><i aria-hidden="true" />Three roots of a healthy tank</p>
          <h2>Take a dive. <em>From surface to roots.</em></h2>

          <div className="aqz-stage" aria-hidden="true">
            <div className="aqz-gauge">
              <span className="aqz-track"><i /></span>
              <ol>{[0, 3, 6, 9, 12].map((d) => <li key={d}>{d}m</li>)}</ol>
            </div>
            <div className="aqz-port">
              <span className="aqz-ring" />
              <span className="aqz-glass">
                {layers.map((l, i) => <img key={l.title} src={l.image} alt="" loading="lazy" className={i === active ? 'is-visible' : ''} />)}
                <Bubbles count={8} />
              </span>
              <span className="aqz-depth"><b>0.0</b><small>metres deep</small></span>
            </div>
          </div>
        </div>

        <div className="aqz-panels">
          {layers.map((l, i) => (
            <article className={`aqz-panel${i === active ? ' is-active' : ''}`} data-i={i} key={l.title}>
              <img className="aqz-panel-img" src={l.image} alt="" loading="lazy" />
              <p className="aqz-zone"><span><l.icon size={18} strokeWidth={1.6} /></span>{l.zone} · {l.depth}m</p>
              <h3>{l.title}, <em>{l.accent}</em></h3>
              <p className="aqz-text">{l.text}</p>
              <ul className="aqz-tags">{l.tags.map((t) => <li key={t}>{t}</li>)}</ul>
              <Link className="aqz-link" href={shop(l.category)}>Shop {l.title.toLowerCase()} care <ArrowUpRight size={16} /></Link>
              <span className="aqz-big" aria-hidden="true">0{i + 1}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
