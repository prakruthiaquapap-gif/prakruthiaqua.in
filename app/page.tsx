import Link from 'next/link';
import { ArrowRight, ArrowUpRight, ShieldCheck, Truck, Headphones, Leaf } from 'lucide-react';
import ImmersiveHero from '@/components/immersive-hero';
import { LatestProducts, ShopByNeed, Spotlight } from '@/components/product-carousel';

const tips = [
  { title: 'Feed little, feed often', text: 'Offer only what your fish finish in two to three minutes, once or twice a day. Leftover food clouds the water.', image: '/images/aquarium.jpg', href: '/shop/?category=Fish%20foods', cta: 'Shop fish foods' },
  { title: 'Refresh water weekly', text: 'Change about a quarter of the water each week, and treat new water with a conditioner before adding it.', image: '/images/water.jpg', href: '/shop/?category=Aquarium%20cleaners', cta: 'Shop water care' },
  { title: 'Feed your plants, too', text: 'Dose plant nutrients after each water change for steady, lush growth and fewer algae problems.', image: '/images/plants.jpg', href: '/shop/?category=Plant%20fertilizers', cta: 'Shop plant care' },
];

const worlds = [
  { title: 'Fish foods', image: '/images/aquarium.jpg', category: 'Fish foods' },
  { title: 'Plant care', image: '/images/plants.jpg', category: 'Plant fertilizers' },
  { title: 'Fish medicines', image: '/images/aquarium-essentials.jpg', category: 'Fish medicines' },
  { title: 'Water care', image: '/images/water.jpg', category: 'Aquarium cleaners' },
  { title: 'Bird foods', image: '/images/birds.jpg', category: 'Bird foods' },
];

const steps = [
  ['Find your favourites', 'Browse fish food, plant care and water essentials made for healthy aquariums.'],
  ['Send an order request', 'Add to your bag and share your details. No online payment is taken.'],
  ['We confirm personally', 'Our team checks stock, shipping and payment with you directly.'],
  ['Delivered with care', 'Packed carefully in Bengaluru and dispatched across India.'],
];

export default function Home() {
  return (
    <main id="main">
      <ImmersiveHero />

      <section className="perks" aria-label="Why shop with us">
        <div className="container perks-grid">
          {([
            [Leaf, 'Made for aquatic life', 'Fish, plant & water care'],
            [ShieldCheck, 'Quality you can trust', 'Carefully formulated'],
            [Truck, 'Pan-India dispatch', 'Packed in Bengaluru'],
            [Headphones, 'Expert guidance', 'Talk to us before you buy'],
          ] as const).map(([Icon, t, d]) => (
            <div className="perk" key={t}><span><Icon size={20} strokeWidth={1.6} /></span><div><b>{t}</b><small>{d}</small></div></div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">✦ Find your world</p>
              <h2>Which world are you <em>caring for today?</em></h2>
            </div>
            <Link className="link-line" href="/shop/">View all categories <ArrowRight size={15} /></Link>
          </div>
          <div className="arches">
            {worlds.map((w) => (
              <Link key={w.title} className="arch" href={`/shop/?category=${encodeURIComponent(w.category)}`}>
                <span className="arch-frame">
                  <img src={w.image} alt="" loading="lazy" />
                  <span className="arch-copy">
                    <small>Collection</small>
                    <b>{w.title}</b>
                    <span>Shop now <ArrowUpRight size={12} /></span>
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-paper">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">✦ Fresh on our shelves</p>
              <h2>Latest <em>products added</em></h2>
            </div>
            <Link className="link-line" href="/shop/">View all <ArrowRight size={15} /></Link>
          </div>
          <LatestProducts />
        </div>
      </section>

      <section className="section section-dark spot-section">
        <div className="container"><Spotlight /></div>
      </section>

      <section className="section">
        <div className="container story">
          <div className="story-media">
            <span className="arch-frame arch-frame-lg"><img src="/images/plants.jpg" alt="A lush planted aquarium" loading="lazy" /></span>
            <span className="story-seal"><img src="/images/prakruthi-icon.svg" alt="" /></span>
          </div>
          <div className="story-copy">
            <p className="eyebrow eyebrow-line">Our story</p>
            <h2>Rooted in nature, <em>made for life.</em></h2>
            <p>Prakruthi Aqua began with a simple idea: every aquarium deserves honest, effective care. From our home in Bengaluru, we make fish nutrition, plant care and water essentials that help little underwater worlds thrive.</p>
            <blockquote>
              “A healthy aquarium isn’t luck — it’s a little care, given the right way, every day. That’s what we put into every bottle and every pack.”
              <cite>— The Prakruthi promise</cite>
            </blockquote>
            <Link className="btn btn-dark" href="/about/">Read our full story <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <section className="stats" aria-label="Prakruthi Aqua in numbers">
        <div className="container stats-grid">
          {[['500+', 'Happy aquarists'], ['50+', 'Care products'], ['10+', 'Years of experience'], ['100%', 'Quality focus']].map(([v, l]) => (
            <div key={l}><strong>{v}</strong><span>{l}</span></div>
          ))}
        </div>
      </section>

      <section className="section section-paper">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">✦ Curated for every tank</p>
              <h2>Shop by <em>need</em></h2>
            </div>
          </div>
          <ShopByNeed />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head section-head-center">
            <div>
              <p className="eyebrow">✦ How it works</p>
              <h2>Good care takes <em>a little love.</em></h2>
            </div>
          </div>
          <ol className="steps">
            {steps.map(([t, d], i) => (
              <li key={t}><span className="step-num">0{i + 1}</span><h3>{t}</h3><p>{d}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section-paper">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">✦ From our care desk</p>
              <h2>Simple habits for a <em>happier tank.</em></h2>
            </div>
            <Link className="link-line" href="/contact/">Ask our team <ArrowRight size={15} /></Link>
          </div>
          <div className="tips">
            {tips.map((t, i) => (
              <article className="tip" key={t.title}>
                <div className="tip-media"><img src={t.image} alt="" loading="lazy" /><span>Tip 0{i + 1}</span></div>
                <div className="tip-body">
                  <h3>{t.title}</h3>
                  <p>{t.text}</p>
                  <Link className="link-line" href={t.href}>{t.cta} <ArrowUpRight size={14} /></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="banner">
        <img src="/images/aquarium-essentials.jpg" alt="" loading="lazy" />
        <div className="banner-shade" />
        <div className="container banner-inner">
          <p className="eyebrow eyebrow-line">Retail &amp; distribution</p>
          <h2>Grow a world of <em>possibilities.</em></h2>
          <p>Bring Prakruthi Aqua to your store, region or aquarium service business.</p>
          <div className="hero-actions">
            <a className="btn btn-leaf" href="https://dealers.prakruthiaqua.in/" target="_blank" rel="noopener noreferrer">Become a dealer <ArrowUpRight size={16} /></a>
            <a className="btn btn-ghost" href="tel:+918904373735">Call +91 89043 73735</a>
          </div>
        </div>
      </section>
    </main>
  );
}
