import Link from 'next/link';
import { ArrowRight, ArrowUpRight, ShieldCheck, Truck, Headphones, Leaf, Search, Send, PhoneCall, PackageCheck, Fish, Sprout, Droplets } from 'lucide-react';
import ImmersiveHero from '@/components/immersive-hero';
import { LatestProducts, ShopByNeed, Spotlight } from '@/components/product-carousel';

const worlds = [
  { title: 'Fish foods', image: '/images/aquarium.jpg', category: 'Fish foods' },
  { title: 'Plant care', image: '/images/plants.jpg', category: 'Plant fertilizers' },
  { title: 'Fish medicines', image: '/images/aquarium-essentials.jpg', category: 'Fish medicines' },
  { title: 'Water care', image: '/images/water.jpg', category: 'Aquarium cleaners' },
  { title: 'Bird foods', image: '/images/birds.jpg', category: 'Bird foods' },
];

const values = [
  [Leaf, 'Made for aquatic life', 'Fish, plant & water care'],
  [ShieldCheck, 'Quality you can trust', 'Carefully formulated'],
  [Truck, 'Pan-India dispatch', 'Packed in Bengaluru'],
  [Headphones, 'Expert guidance', 'Talk to us before you buy'],
] as const;

const pillars = [
  { icon: Fish, title: 'Fish', text: 'Nutrition and gentle health care for vibrant, active fish.', image: '/images/aquarium.jpg', category: 'Fish foods' },
  { icon: Sprout, title: 'Plants', text: 'Nutrients that keep underwater gardens lush and green.', image: '/images/plants.jpg', category: 'Plant fertilizers' },
  { icon: Droplets, title: 'Water', text: 'Conditioners and cleaners for clear, balanced water.', image: '/images/water.jpg', category: 'Aquarium cleaners' },
];

const stats = [['500+', 'Happy aquarists'], ['50+', 'Care products'], ['10+', 'Years of experience']] as const;

const steps = [
  [Search, 'Find your favourites', 'Browse fish food, plant care and water essentials made for healthy aquariums.'],
  [Send, 'Send an order request', 'Add to your bag and share your details. No online payment is taken.'],
  [PhoneCall, 'We confirm personally', 'Our team checks stock, shipping and payment with you directly.'],
  [PackageCheck, 'Delivered with care', 'Packed carefully in Bengaluru and dispatched across India.'],
] as const;

const tips = [
  { title: 'Feed little, feed often', text: 'Offer only what your fish finish in two to three minutes, once or twice a day. Leftover food clouds the water.', image: '/images/aquarium.jpg', href: '/shop/?category=Fish%20foods', cta: 'Shop fish foods' },
  { title: 'Refresh water weekly', text: 'Change about a quarter of the water each week, and treat new water with a conditioner before adding it.', image: '/images/water.jpg', href: '/shop/?category=Aquarium%20cleaners', cta: 'Shop water care' },
  { title: 'Feed your plants, too', text: 'Dose plant nutrients after each water change for steady, lush growth and fewer algae problems.', image: '/images/plants.jpg', href: '/shop/?category=Plant%20fertilizers', cta: 'Shop plant care' },
];

const shop = (c: string) => `/shop/?category=${encodeURIComponent(c)}`;

export default function Home() {
  return (
    <main id="main" className="home">
      <ImmersiveHero />

      <section className="hv" aria-label="Why shop with us">
        <div className="container hv-grid">
          {values.map(([Icon, t, d]) => (
            <div className="hv-item" key={t}><span><Icon size={20} strokeWidth={1.7} /></span><div><b>{t}</b><small>{d}</small></div></div>
          ))}
        </div>
      </section>

      <section className="section hw">
        <div className="container">
          <div className="hk-head hk-head-center">
            <p className="hk-eyebrow"><Leaf size={14} /> Shop by world</p>
            <h2>Every little world, <em>cared for.</em></h2>
          </div>
          <div className="hw-grid">
            {worlds.map((w) => (
              <Link key={w.title} className="hw-item" href={shop(w.category)}>
                <span className="hw-circle"><img src={w.image} alt="" loading="lazy" /></span>
                <b>{w.title}</b>
                <small>Explore <ArrowUpRight size={12} /></small>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-paper">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="hk-eyebrow"><Leaf size={14} /> Fresh on our shelves</p>
              <h2>Latest <em>products added</em></h2>
            </div>
            <Link className="link-line" href="/shop/">View all <ArrowRight size={15} /></Link>
          </div>
          <LatestProducts />
        </div>
      </section>

      <section className="section hp">
        <div className="container">
          <div className="hk-head hk-head-split">
            <div>
              <p className="hk-eyebrow"><Leaf size={14} /> Three roots of a healthy tank</p>
              <h2>Rooted in nature. <em>Grown with care.</em></h2>
            </div>
            <p>Like the tree in our logo, a thriving aquarium grows from strong roots — healthy fish, living plants and balanced water.</p>
          </div>
          <div className="hp-grid">
            {pillars.map((p, i) => (
              <Link key={p.title} className="hp-card" href={shop(p.category)}>
                <img src={p.image} alt="" loading="lazy" />
                <span className="hp-num">0{i + 1}</span>
                <span className="hp-body">
                  <span className="hp-icon"><p.icon size={22} strokeWidth={1.6} /></span>
                  <b>{p.title}</b>
                  <small>{p.text}</small>
                  <span className="hp-link">Shop {p.title.toLowerCase()} care <ArrowUpRight size={14} /></span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-dark spot-section">
        <div className="container"><Spotlight /></div>
      </section>

      <section className="section hs">
        <div className="container hs-grid">
          <div className="hs-visual" aria-hidden="true">
            <span className="hs-disc" />
            <span className="hs-orbit" />
            <img className="hs-tree" src="/images/prakruthi-icon.svg" alt="" />
            <span className="hs-photo hs-photo-a"><img src="/images/plants.jpg" alt="" loading="lazy" /></span>
            <span className="hs-photo hs-photo-b"><img src="/images/aquarium.jpg" alt="" loading="lazy" /></span>
          </div>
          <div className="hs-copy">
            <p className="hk-eyebrow"><Leaf size={14} /> Our story</p>
            <h2>A little care. <em>A world of life.</em></h2>
            <p>Prakruthi Aqua began with a simple idea: every aquarium deserves honest, effective care. From our home in Bengaluru, we make fish nutrition, plant care and water essentials that help little underwater worlds thrive.</p>
            <blockquote>“A healthy aquarium isn’t luck — it’s a little care, given the right way, every day.”</blockquote>
            <dl className="hs-stats">
              {stats.map(([v, l]) => <div key={l}><dt>{l}</dt><dd>{v}</dd></div>)}
            </dl>
            <Link className="btn btn-dark" href="/about/">Read our full story <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <section className="section section-paper ht">
        <div className="container">
          <div className="hk-head hk-head-center">
            <p className="hk-eyebrow"><Leaf size={14} /> How it works</p>
            <h2>Good care takes <em>a little love.</em></h2>
            <p>No online payment, no guesswork — our team confirms every order with you personally.</p>
          </div>
          <ol className="ht-steps">
            {steps.map(([Icon, t, d], i) => (
              <li key={t}>
                <span className="ht-node"><Icon size={22} strokeWidth={1.6} /><i>{i + 1}</i></span>
                <h3>{t}</h3>
                <p>{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="hk-eyebrow"><Leaf size={14} /> Curated for every tank</p>
              <h2>Shop by <em>need</em></h2>
            </div>
          </div>
          <ShopByNeed />
        </div>
      </section>

      <section className="section section-paper">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="hk-eyebrow"><Leaf size={14} /> From our care desk</p>
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

      <section className="section hd">
        <div className="container">
          <div className="hd-card">
            <div className="hd-copy">
              <p className="hk-eyebrow"><Leaf size={14} /> Retail &amp; distribution</p>
              <h2>Grow a world of <em>possibilities.</em></h2>
              <p>Bring Prakruthi Aqua to your store, region or aquarium service business. Register on our dealer portal as a dealer, sub dealer or retail outlet.</p>
              <div className="hero-actions">
                <a className="btn btn-dark" href="https://dealers.prakruthiaqua.in/" target="_blank" rel="noopener noreferrer">Become a dealer <ArrowUpRight size={16} /></a>
                <a className="btn btn-outline" href="tel:+918904373735">Call +91 89043 73735</a>
              </div>
            </div>
            <div className="hd-visual">
              <img src="/images/aquarium-essentials.jpg" alt="" loading="lazy" />
              <img className="hd-tree" src="/images/prakruthi-icon.svg" alt="" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
