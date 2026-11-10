import Link from 'next/link';
import { ArrowUpRight, Leaf, Fish, Droplets, Heart, ShieldCheck, FlaskConical, Recycle, BookOpen, Award, Target, Users } from 'lucide-react';
import PageBanner from '@/components/page-banner';

export const metadata = {
  title: 'About Prakruthi Aqua',
  description: 'Your trusted partner in premium aquarium care solutions. Discover our story, vision, mission, values and commitment to aquatic ecosystems.',
};

type Item = { icon: typeof Leaf; title: string; text: string };
const mission: Item[] = [
  { icon: ShieldCheck, title: 'Quality First', text: 'Develop and deliver premium fish care solutions, aqua fertilizers, and professional aquarium essentials that meet the highest standards of quality, safety, and effectiveness.' },
  { icon: FlaskConical, title: 'Scientific Innovation', text: 'Continuously research and innovate to create advanced formulations that address the evolving needs of modern aquarium management and aquatic ecosystem health.' },
  { icon: Users, title: 'Customer Success', text: 'Support our customers with expert guidance, educational resources, and exceptional service to ensure their success in maintaining thriving aquatic environments.' },
  { icon: Recycle, title: 'Environmental Responsibility', text: 'Promote sustainable practices and develop eco-friendly products that protect and preserve aquatic ecosystems for future generations.' },
];
const values: Item[] = [
  { icon: Award, title: 'Quality Excellence', text: 'We ensure every product meets the highest standards of quality and effectiveness.' },
  { icon: Heart, title: 'Care & Compassion', text: 'We genuinely care about the health and well-being of all aquatic life.' },
  { icon: FlaskConical, title: 'Innovation', text: 'Continuously developing advanced solutions for modern aquarium care.' },
  { icon: Users, title: 'Customer First', text: 'Your success in maintaining thriving aquatic ecosystems is our priority.' },
];
const goals: Item[] = [
  { icon: Fish, title: 'Aquatic Well-being', text: 'Promoting the health and vitality of all aquatic life through quality products.' },
  { icon: Recycle, title: 'Environmental Sustainability', text: 'Developing eco-friendly solutions that protect aquatic ecosystems.' },
  { icon: BookOpen, title: 'Community Education', text: 'Empowering aquarists with knowledge and best practices.' },
  { icon: Target, title: 'Excellence Standards', text: 'Setting new benchmarks in product quality and customer service.' },
];
const services = [
  { icon: Fish, title: 'Fish Care Solutions', text: 'Premium nutrition, health supplements, and medications designed to keep your fish healthy, vibrant, and thriving.', image: '/images/aquarium.jpg', category: 'Fish foods' },
  { icon: Leaf, title: 'Aqua Fertilizers', text: 'Advanced plant nutrients and fertilizers that promote lush, healthy aquatic vegetation and balanced ecosystems.', image: '/images/plants.jpg', category: 'Plant fertilizers' },
  { icon: Droplets, title: 'Aquarium Essentials', text: 'Professional-grade water conditioners, test kits, and equipment for maintaining optimal water quality.', image: '/images/water.jpg', category: 'Aquarium cleaners' },
];

export default function About() {
  return (
    <main id="main">
      <PageBanner
        label="Our Story"
        eyebrow="Rooted in nature. Made for life."
        title="About"
        accent="Prakruthi Aqua."
        description="Your trusted partner in premium aquarium care solutions — from Bengaluru, with care."
        image="/images/aquarium.jpg"
        imageAlt="Colourful fish swimming through an aquarium"
        primaryLabel="Read our story"
        primaryHref="#our-story"
        secondaryLabel="Shop products"
        secondaryHref="/shop/"
      />

      <nav className="subnav" aria-label="About page sections">
        <div className="container">
          {[['our-story', 'Story'], ['vision', 'Vision'], ['mission', 'Mission'], ['values', 'Values'], ['goals', 'Goals'], ['what-we-do', 'What we do']].map(([id, label]) => (
            <a href={`#${id}`} key={id}>{label}</a>
          ))}
        </div>
      </nav>

      <section id="our-story" className="section anchor">
        <div className="container split">
          <div className="split-copy">
            <p className="eyebrow"><span className="dot" />01 · Where it began</p>
            <h2>Our <em>story.</em></h2>
            <p className="lead">Prakruthi Aqua was founded with a simple mission: to provide aquarium enthusiasts and professionals with the highest quality products for maintaining healthy, thriving aquatic ecosystems.</p>
            <p>With years of experience in aquaculture and a deep passion for aquatic life, we’ve developed a comprehensive range of fish care solutions, aqua fertilizers, and professional aquarium essentials.</p>
            <p>Our products are the result of extensive research, rigorous testing, and collaboration with aquatic biologists and experienced aquarists. We’re committed to supporting the well-being of fishes, plants, and water ecosystems around the world.</p>
          </div>
          <div className="split-media">
            <img src="/images/water.jpg" alt="An aquatic ecosystem" loading="lazy" />
            <div className="split-inset"><img src="/images/plants.jpg" alt="Detail of an underwater garden" loading="lazy" /></div>
            <span className="split-badge"><Leaf size={16} /> Rooted in nature</span>
          </div>
        </div>
      </section>

      <section id="vision" className="section section-dark anchor">
        <div className="container vision">
          <p className="eyebrow eyebrow-leaf">02 · Our vision</p>
          <blockquote>To be the world’s most trusted and innovative provider of aquarium care solutions, setting new standards in <em>aquatic health and ecosystem sustainability.</em></blockquote>
          <p>We envision a future where every aquarium enthusiast and professional has access to premium, scientifically-backed products that ensure the optimal health of fish, plants, and aquatic ecosystems. Our vision extends beyond selling products — we aim to create a community of passionate aquarists who are empowered with knowledge, supported by excellence, and united by their love for aquatic life.</p>
        </div>
      </section>

      <section id="mission" className="section anchor">
        <div className="container">
          <div className="section-head"><div><p className="eyebrow"><span className="dot" />03 · Purpose in every product</p><h2>Our <em>mission.</em></h2></div></div>
          <div className="card-grid card-grid-2">
            {mission.map((m, i) => (
              <article className="info-card" key={m.title}>
                <div className="info-card-top"><span className="icon-tile"><m.icon size={20} strokeWidth={1.6} /></span><span className="step-num">0{i + 1}</span></div>
                <h3>{m.title}</h3><p>{m.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="values" className="section section-paper anchor">
        <div className="container">
          <div className="section-head"><div><p className="eyebrow"><span className="dot" />04 · What we stand for</p><h2>Our core <em>values.</em></h2></div><p className="muted">The principles that guide everything we do.</p></div>
          <div className="card-grid card-grid-4">
            {values.map((v) => (
              <article className="info-card" key={v.title}><span className="icon-tile icon-tile-leaf"><v.icon size={20} strokeWidth={1.6} /></span><h3>{v.title}</h3><p>{v.text}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section id="goals" className="section anchor">
        <div className="container">
          <div className="section-head"><div><p className="eyebrow"><span className="dot" />05 · A shared direction</p><h2>Strategic <em>goals.</em></h2></div><p className="muted">Key objectives that guide our path forward.</p></div>
          <div className="goal-list">
            {goals.map((g, i) => (
              <article key={g.title}><span className="goal-num">0{i + 1}</span><g.icon size={22} strokeWidth={1.5} /><h3>{g.title}</h3><p>{g.text}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section id="what-we-do" className="section section-paper anchor">
        <div className="container">
          <div className="section-head"><div><p className="eyebrow"><span className="dot" />06 · Care for every little world</p><h2>What <em>we do.</em></h2></div><p className="muted">Comprehensive solutions for all your aquarium needs.</p></div>
          <div className="card-grid card-grid-3">
            {services.map((s) => (
              <article className="service-card" key={s.title}>
                <div className="service-media"><img src={s.image} alt="" loading="lazy" /><span className="icon-tile icon-tile-leaf"><s.icon size={20} strokeWidth={1.6} /></span></div>
                <div className="service-body"><h3>{s.title}</h3><p>{s.text}</p><Link className="link-arrow" href={`/shop/?category=${encodeURIComponent(s.category)}`}>Explore <ArrowUpRight size={16} /></Link></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container">
          <div className="partner">
            <div className="partner-copy">
              <p className="eyebrow eyebrow-dark">07 · Our promise</p>
              <h2>Our <em>commitment.</em></h2>
              <p>We are committed to supporting the well-being of fishes, plants, and water ecosystems through continuous innovation, unwavering quality standards, and dedicated customer service. Every product, solution and interaction is guided by our mission to make aquarium keeping more successful, sustainable, and rewarding.</p>
              <div className="partner-actions"><Link href="/shop/" className="btn btn-dark btn-lg">Explore products <ArrowUpRight size={17} /></Link></div>
            </div>
            <div className="partner-visual"><img src="/images/plants.jpg" alt="A thriving aquatic garden" loading="lazy" /></div>
          </div>
        </div>
      </section>
    </main>
  );
}
