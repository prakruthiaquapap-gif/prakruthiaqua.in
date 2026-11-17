import Link from 'next/link';
import PageBanner from '@/components/page-banner';
import { ArrowUpRight, Leaf, Fish, Droplets, Heart, ShieldCheck, FlaskConical, Recycle, BookOpen, Award, Target, Users } from 'lucide-react';

export const metadata = {
  title: 'About Prakruthi Aqua',
  description: 'Your trusted partner in premium aquarium care solutions. Discover our story, vision, mission, values and commitment to aquatic ecosystems.',
};

type Item = { icon: typeof Leaf; title: string; text: string };
const mission: Item[] = [
  { icon: ShieldCheck, title: 'Quality first', text: 'Develop and deliver premium fish care solutions, aqua fertilizers, and professional aquarium essentials that meet the highest standards of quality, safety, and effectiveness.' },
  { icon: FlaskConical, title: 'Scientific innovation', text: 'Continuously research and innovate to create advanced formulations that address the evolving needs of modern aquarium management and aquatic ecosystem health.' },
  { icon: Users, title: 'Customer success', text: 'Support our customers with expert guidance, educational resources, and exceptional service to ensure their success in maintaining thriving aquatic environments.' },
  { icon: Recycle, title: 'Environmental responsibility', text: 'Promote sustainable practices and develop eco-friendly products that protect and preserve aquatic ecosystems for future generations.' },
];
const values: Item[] = [
  { icon: Award, title: 'Quality excellence', text: 'Every product meets the highest standards of quality and effectiveness.' },
  { icon: Heart, title: 'Care & compassion', text: 'We genuinely care about the health and well-being of all aquatic life.' },
  { icon: FlaskConical, title: 'Innovation', text: 'Continuously developing advanced solutions for modern aquarium care.' },
  { icon: Users, title: 'Customer first', text: 'Your success with a thriving aquarium is our priority.' },
];
const goals: Item[] = [
  { icon: Fish, title: 'Aquatic well-being', text: 'Promoting the health and vitality of all aquatic life through quality products.' },
  { icon: Recycle, title: 'Sustainability', text: 'Developing eco-friendly solutions that protect aquatic ecosystems.' },
  { icon: BookOpen, title: 'Community education', text: 'Empowering aquarists with knowledge and best practices.' },
  { icon: Target, title: 'Excellence standards', text: 'Setting new benchmarks in product quality and customer service.' },
];
const services = [
  { icon: Fish, title: 'Fish care solutions', text: 'Premium nutrition, health supplements, and medications designed to keep your fish healthy, vibrant, and thriving.', image: '/images/aquarium.jpg', category: 'Fish foods' },
  { icon: Leaf, title: 'Aqua fertilizers', text: 'Advanced plant nutrients and fertilizers that promote lush, healthy aquatic vegetation and balanced ecosystems.', image: '/images/plants.jpg', category: 'Plant fertilizers' },
  { icon: Droplets, title: 'Aquarium essentials', text: 'Professional-grade water conditioners, test kits, and equipment for maintaining optimal water quality.', image: '/images/water.jpg', category: 'Aquarium cleaners' },
];
const stats: [string, string][] = [['10+', 'Years of experience'], ['50+', 'Care products'], ['500+', 'Happy aquarists']];
const strip = [
  { image: '/images/aquarium.jpg', label: 'Fish', alt: 'Colourful fish in a thriving aquarium' },
  { image: '/images/plants.jpg', label: 'Plants', alt: 'Lush aquatic plants' },
  { image: '/images/water.jpg', label: 'Water', alt: 'Clear, healthy aquarium water' },
];

export default function About() {
  return (
    <main id="main" className="about">
      <PageBanner
        label="Our story"
        eyebrow="From Bengaluru, with care"
        title="Rooted in nature."
        accent="Made for life."
        description="Prakruthi Aqua is your partner in aquarium care — fish nutrition, plant care and water essentials that help little underwater worlds thrive."
        image="/images/aquarium-essentials.jpg"
        imageAlt="A single orange goldfish with flowing fins against dark water"
        disc={{ image: '/images/prakruthi-icon.svg', alt: 'Prakruthi Aqua tree emblem', name: 'Fish · Plants · Water', label: 'Our three roots', logo: true }}
        primaryLabel="Read our story"
        primaryHref="#our-story"
        secondaryLabel="Shop products"
        secondaryHref="/shop/"
        stats={stats}
      />

      <nav className="subnav" aria-label="About page sections">
        <div className="container">
          {[['our-story', 'Story'], ['vision', 'Vision'], ['mission', 'Mission'], ['values', 'Values'], ['what-we-do', 'What we do']].map(([id, label]) => (
            <a href={`#${id}`} key={id}>{label}</a>
          ))}
        </div>
      </nav>

      <section id="our-story" className="section anchor">
        <div className="container">
          <div className="about-story">
            <div className="about-story-head">
              <p className="eyebrow"><span className="dot" />01 · Where it began</p>
              <h2>Our <em>story.</em></h2>
            </div>
            <div className="about-story-body">
              <p className="about-story-lead">Prakruthi Aqua was founded with a simple mission: to give aquarium enthusiasts and professionals the highest quality products for healthy, thriving aquatic ecosystems.</p>
              <div className="about-story-cols">
                <p>With years of experience in aquaculture and a deep passion for aquatic life, we’ve developed a comprehensive range of fish care solutions, aqua fertilizers, and professional aquarium essentials.</p>
                <p>Our products are the result of extensive research, rigorous testing, and collaboration with aquatic biologists and experienced aquarists — committed to the well-being of fishes, plants, and water ecosystems.</p>
              </div>
            </div>
          </div>
          <div className="about-strip">
            {strip.map((s, i) => (
              <figure key={s.label}>
                <img src={s.image} alt={s.alt} loading="lazy" />
                <figcaption><span>0{i + 1}</span>{s.label}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="vision" className="section section-dark anchor about-vision">
        <div className="container vision">
          <p className="eyebrow eyebrow-leaf">02 · Our vision</p>
          <blockquote>To be the most trusted and innovative provider of aquarium care, setting new standards in <em>aquatic health and ecosystem sustainability.</em></blockquote>
          <p>We envision a future where every aquarist has access to premium, scientifically-backed products for healthy fish, plants and water — and a community of passionate keepers, empowered with knowledge and united by their love for aquatic life.</p>
        </div>
      </section>

      <section id="mission" className="section anchor">
        <div className="container pillars">
          <div className="pillars-head">
            <p className="eyebrow"><span className="dot" />03 · Purpose in every product</p>
            <h2>Our <em>mission.</em></h2>
            <p className="muted">Four commitments behind every bottle and pack we make.</p>
            <Link className="link-line" href="/contact/">Talk to our team <ArrowUpRight size={14} /></Link>
          </div>
          <ol className="pillars-list">
            {mission.map((m, i) => (
              <li key={m.title}>
                <span className="pillars-num">0{i + 1}</span>
                <div>
                  <h3><m.icon size={20} strokeWidth={1.6} /> {m.title}</h3>
                  <p>{m.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="values" className="section section-paper anchor">
        <div className="container">
          <div className="section-head"><div><p className="eyebrow"><span className="dot" />04 · What we stand for</p><h2>Values &amp; <em>goals.</em></h2></div><p className="muted">The principles that guide us, and where they’re taking us.</p></div>
          <div className="value-grid">
            {values.map((v) => (
              <article className="value-card" key={v.title}>
                <span className="icon-tile"><v.icon size={20} strokeWidth={1.6} /></span>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </article>
            ))}
          </div>
          <div className="goal-list">
            {goals.map((g, i) => (
              <article key={g.title}><span className="goal-num">0{i + 1}</span><g.icon size={22} strokeWidth={1.5} /><h3>{g.title}</h3><p>{g.text}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section id="what-we-do" className="section anchor">
        <div className="container">
          <div className="section-head"><div><p className="eyebrow"><span className="dot" />05 · Care for every little world</p><h2>What <em>we do.</em></h2></div><p className="muted">Complete care for fish, plants and water.</p></div>
          <div className="card-grid card-grid-3">
            {services.map((s) => (
              <Link className="service-card" key={s.title} href={`/shop/?category=${encodeURIComponent(s.category)}`}>
                <div className="service-media"><img src={s.image} alt="" loading="lazy" /><span className="icon-tile icon-tile-leaf"><s.icon size={20} strokeWidth={1.6} /></span></div>
                <div className="service-body"><h3>{s.title}</h3><p>{s.text}</p><span className="link-arrow">Explore <ArrowUpRight size={16} /></span></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-tight about-promise">
        <div className="container">
          <div className="partner">
            <div className="partner-copy">
              <p className="eyebrow eyebrow-dark">06 · Our promise</p>
              <h2>Our <em>commitment.</em></h2>
              <p>Continuous innovation, unwavering quality and dedicated service — every product and every conversation is guided by one aim: making aquarium keeping more successful, sustainable and rewarding.</p>
              <div className="partner-actions">
                <Link href="/shop/" className="btn btn-dark btn-lg">Explore products <ArrowUpRight size={17} /></Link>
                <a className="link-line" href="tel:+918904373735">Call +91 89043 73735</a>
              </div>
            </div>
            <div className="partner-visual"><img src="/images/water.jpg" alt="A thriving aquatic garden" loading="lazy" /></div>
          </div>
        </div>
      </section>
    </main>
  );
}
