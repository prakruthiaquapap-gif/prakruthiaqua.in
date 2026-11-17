import Link from 'next/link';
import { ArrowRight, ArrowUpRight, ShieldCheck, Truck, Headphones, Leaf, Search, Send, PhoneCall, PackageCheck, Store, Wrench, Fish, Droplets, Sprout, Phone } from 'lucide-react';
import ImmersiveHero from '@/components/immersive-hero';
import Reveal from '@/components/reveal';
import DiveSection from '@/components/dive-section';
import AquariumScene, { FrontPlants } from '@/components/aquarium-scene';
import { Bubbles, Caustics, Wave } from '@/components/aquatic-fx';
import { LatestProducts, ShopByNeed } from '@/components/product-carousel';

const worlds = [
  { title: 'Fish foods', image: '/images/aquarium.jpg', category: 'Fish foods', note: 'Nourish' },
  { title: 'Plant care', image: '/images/plants.jpg', category: 'Plant fertilizers', note: 'Grow' },
  { title: 'Fish medicines', image: '/images/aquarium-essentials.jpg', category: 'Fish medicines', note: 'Heal' },
  { title: 'Water care', image: '/images/water.jpg', category: 'Aquarium cleaners', note: 'Balance' },
  { title: 'Bird foods', image: '/images/birds.jpg', category: 'Bird foods', note: 'Delight' },
];

const values = [
  [Leaf, 'Made for aquatic life', 'Fish, plant & water care'],
  [ShieldCheck, 'Quality you can trust', 'Carefully formulated'],
  [Truck, 'Pan-India dispatch', 'Packed in Bengaluru'],
  [Headphones, 'Expert guidance', 'Talk to us before you buy'],
] as const;



const stats = [['500+', 'Happy aquarists'], ['50+', 'Care products'], ['10+', 'Years of experience']] as const;

const steps = [
  [Search, 'Find your favourites', 'Browse fish food, plant care and water essentials made for healthy aquariums.'],
  [Send, 'Send an order request', 'Add to your bag and share your details. No online payment is taken.'],
  [PhoneCall, 'We confirm personally', 'Our team checks stock, shipping and payment with you directly.'],
  [PackageCheck, 'Delivered with care', 'Packed carefully in Bengaluru and dispatched across India.'],
] as const;

const tips = [
  { icon: Fish, freq: 'Daily · 1–2 times', title: 'Feed little, feed often', text: 'Offer only what your fish finish in two to three minutes, once or twice a day. Leftover food clouds the water.', image: '/images/aquarium.jpg', href: '/shop/?category=Fish%20foods', cta: 'Shop fish foods' },
  { icon: Droplets, freq: 'Weekly · 25% water', title: 'Refresh water weekly', text: 'Change about a quarter of the water each week, and treat new water with a conditioner before adding it.', image: '/images/water.jpg', href: '/shop/?category=Aquarium%20cleaners', cta: 'Shop water care' },
  { icon: Sprout, freq: 'After each water change', title: 'Feed your plants, too', text: 'Dose plant nutrients after each water change for steady, lush growth and fewer algae problems.', image: '/images/plants.jpg', href: '/shop/?category=Plant%20fertilizers', cta: 'Shop plant care' },
];

const week = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const partners = [
  { icon: Store, label: 'Retail stores', orbit: 1, angle: 20 },
  { icon: Truck, label: 'Wholesale', orbit: 1, angle: 200 },
  { icon: Wrench, label: 'Aquarium services', orbit: 2, angle: 110 },
  { icon: Phone, label: 'Pan-India dispatch', orbit: 2, angle: 290 },
] as const;

const shop = (c: string) => `/shop/?category=${encodeURIComponent(c)}`;

function Head({ eyebrow, title, accent, children, center = false }: { eyebrow: string; title: string; accent: string; children?: React.ReactNode; center?: boolean }) {
  return (
    <div className={`aq-head${center ? ' aq-head-center' : ''}`} data-reveal>
      <div>
        <p className="aq-eyebrow"><i aria-hidden="true" />{eyebrow}</p>
        <h2>{title} <em>{accent}</em></h2>
      </div>
      {children && <div className="aq-head-side">{children}</div>}
    </div>
  );
}

export default function Home() {
  return (
    <main id="main" className="home aq-home">
      <Reveal />
      <ImmersiveHero />

      <section className="aqv" aria-label="Why shop with us">
        <Wave className="aqv-wave" />
        <div className="container aqv-grid">
          {values.map(([Icon, t, d], i) => (
            <div className="aqv-item" key={t} data-reveal style={{ animationDelay: `${i * 80}ms` }}>
              <span><Icon size={20} strokeWidth={1.6} /></span>
              <div><b>{t}</b><small>{d}</small></div>
            </div>
          ))}
        </div>
      </section>

      <section className="section aqw aqw-scene">
        <Wave className="aqw-wave" />
        <AquariumScene />
        <div className="container">
          <Head eyebrow="Shop by world" title="Every little world," accent="cared for." center>
            <p>Five collections, one philosophy — honest, effective care for the life beneath the surface.</p>
          </Head>
          <div className="aqw-grid">
            {worlds.map((w, i) => (
              <Link key={w.title} className="aqw-item" href={shop(w.category)} data-reveal data-tilt style={{ animationDelay: `${i * 70}ms` }}>
                <span className="aqw-tank">
                  <img src={w.image} alt="" loading="lazy" />
                  <span className="aqw-shine" aria-hidden="true" />
                  <span className="aqw-glare" aria-hidden="true" />
                  <span className="aqw-num">0{i + 1}</span>
                  <span className="aqw-body">
                    <small>{w.note}</small>
                    <b>{w.title}</b>
                    <span className="aqw-go">Explore <ArrowUpRight size={13} /></span>
                  </span>
                </span>
              </Link>
            ))}
          </div>
          <FrontPlants />
        </div>
      </section>

      <section className="section aq-soft">
        <div className="container">
          <Head eyebrow="Fresh on our shelves" title="Latest" accent="products added">
            <Link className="aq-pill-link" href="/shop/">View all <ArrowRight size={15} /></Link>
          </Head>
          <div data-reveal><LatestProducts /></div>
        </div>
      </section>

      <DiveSection />


      <section className="section aqs">
        <div className="container aqs-grid">
          <div className="aqs-visual" aria-hidden="true" data-reveal>
            <span className="aqs-orbit" />
            <span className="aqs-arch"><img src="/images/plants.jpg" alt="" loading="lazy" /><Caustics /></span>
            <span className="aqs-port"><img src="/images/aquarium.jpg" alt="" loading="lazy" /></span>
            <span className="aqs-seal"><img src="/images/prakruthi-icon.svg" alt="" /></span>
            <span className="aqs-years"><b>10<sup>+</sup></b><small>Years of<br />aquatic care</small></span>
          </div>
          <div className="aqs-copy" data-reveal>
            <p className="aq-eyebrow"><i aria-hidden="true" />Our story</p>
            <h2>A little care. <em>A world of life.</em></h2>
            <p>Prakruthi Aqua began with a simple idea: every aquarium deserves honest, effective care. From our home in Bengaluru, we make fish nutrition, plant care and water essentials that help little underwater worlds thrive.</p>
            <blockquote><span aria-hidden="true">“</span>A healthy aquarium isn’t luck — it’s a little care, given the right way, every day.</blockquote>
            <dl className="aqs-stats">
              {stats.map(([v, l]) => <div key={l}><dt>{l}</dt><dd>{v}</dd></div>)}
            </dl>
            <Link className="btn btn-dark aq-btn" href="/about/">Read our full story <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <section className="section aq-soft aqt">
        <div className="container">
          <Head eyebrow="How it works" title="Good care takes" accent="a little love." center>
            <p>No online payment, no guesswork — our team confirms every order with you personally.</p>
          </Head>
          <ol className="aqt-steps">
            {steps.map(([Icon, t, d], i) => (
              <li key={t} data-reveal style={{ animationDelay: `${i * 90}ms` }}>
                <span className="aqt-num" aria-hidden="true">0{i + 1}</span>
                <span className="aqt-icon"><Icon size={22} strokeWidth={1.6} /></span>
                <h3>{t}</h3>
                <p>{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section aqn">
        <div className="container">
          <Head eyebrow="Curated for every tank" title="Shop by" accent="need" />
          <div data-reveal><ShopByNeed /></div>
        </div>
      </section>

      <section className="section aqc">
        <div className="container aqc-grid">
          <div className="aqc-intro" data-reveal>
            <Bubbles count={8} className="aqc-bubbles" />
            <p className="aq-eyebrow"><i aria-hidden="true" />From our care desk</p>
            <h2>Simple habits for a <em>happier tank.</em></h2>
            <p className="aqc-lead">Three small rituals keep water clear, fish bright and plants growing. Here is the rhythm our team recommends.</p>
            <div className="aqc-week" aria-label="A typical care week: feed every day, change water once a week">
              {week.map((d, i) => (
                <span key={i} className={i === 6 ? 'is-change' : ''} style={{ '--d': i } as React.CSSProperties}>
                  <b>{d}</b>
                  <i className="aqc-feed" />
                  {i === 6 && <i className="aqc-drop"><Droplets size={11} /></i>}
                </span>
              ))}
            </div>
            <p className="aqc-legend"><span><i className="aqc-feed" /> Feed</span><span><i className="aqc-drop"><Droplets size={9} /></i> Water change</span></p>
            <dl className="aqc-facts">
              <div><dt>Feeding window</dt><dd>2–3<small>min</small></dd></div>
              <div><dt>Weekly water change</dt><dd>25<small>%</small></dd></div>
              <div><dt>Plant dose</dt><dd>1<small>/change</small></dd></div>
            </dl>
            <Link className="aqx-cta aqc-cta" href="/contact/"><span>Ask our team</span><i><ArrowUpRight size={17} /></i></Link>
          </div>
          <ol className="aqc-list">
            {tips.map((t, i) => (
              <li className="aqc-item" key={t.title} data-reveal style={{ animationDelay: `${i * 110}ms` }}>
                <span className="aqc-photo">
                  <span className="aqc-ring" aria-hidden="true" />
                  <span className="aqc-photo-clip"><img src={t.image} alt="" loading="lazy" /></span>
                  <span className="aqc-icon"><t.icon size={16} strokeWidth={1.8} /></span>
                </span>
                <div className="aqc-text">
                  <span className="aqc-freq">{t.freq}</span>
                  <h3>{t.title}</h3>
                  <p>{t.text}</p>
                  <Link className="aqc-link" href={t.href}>{t.cta} <ArrowUpRight size={14} /></Link>
                </div>
                <span className="aqc-num" aria-hidden="true">0{i + 1}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section aqp2">
        <div className="container">
          <div className="aqp2-card" data-reveal>
            <span className="aqp2-glow" aria-hidden="true" />
            <Bubbles count={10} className="aqp2-bubbles" />
            <div className="aqp2-copy">
              <p className="aq-eyebrow"><i aria-hidden="true" />Retail &amp; distribution</p>
              <h2>Grow a world of <em>possibilities.</em></h2>
              <p className="aqp2-lead">Bring Prakruthi Aqua to your store, region or aquarium service business. Register on our dealer portal as a dealer, sub dealer or retail outlet.</p>
              <ul className="aqp2-types">
                <li><span>01</span>Dealer</li>
                <li><span>02</span>Sub dealer</li>
                <li><span>03</span>Retail outlet</li>
              </ul>
              <div className="aqp2-actions">
                <a className="aqx-cta aqp2-cta" href="https://dealers.prakruthiaqua.in/" target="_blank" rel="noopener noreferrer"><span>Become a dealer</span><i><ArrowUpRight size={17} /></i></a>
                <a className="aqp2-call" href="tel:+918904373735"><span><PhoneCall size={16} /></span>+91 89043 73735</a>
              </div>
            </div>
            <div className="aqp2-visual" aria-hidden="true">
              <span className="aqp2-ripple" /><span className="aqp2-ripple" /><span className="aqp2-ripple" />
              <span className="aqp2-orbit is-1" />
              <span className="aqp2-orbit is-2" />
              <span className="aqp2-spinner is-1">
                {partners.filter((p) => p.orbit === 1).map((p) => (
                  <span key={p.label} className="aqp2-node" style={{ '--a': `${p.angle}deg` } as React.CSSProperties}><span><p.icon size={15} />{p.label}</span></span>
                ))}
              </span>
              <span className="aqp2-spinner is-2">
                {partners.filter((p) => p.orbit === 2).map((p) => (
                  <span key={p.label} className="aqp2-node" style={{ '--a': `${p.angle}deg` } as React.CSSProperties}><span><p.icon size={15} />{p.label}</span></span>
                ))}
              </span>
              <span className="aqp2-core">
                <span className="aqp2-core-clip"><img src="/images/aquarium-essentials.jpg" alt="" loading="lazy" /></span>
              </span>
              <span className="aqp2-hub"><img src="/images/prakruthi-icon.svg" alt="" /></span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
