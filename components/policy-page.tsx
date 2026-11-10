import Link from 'next/link';
import { ArrowUpRight, CalendarDays, Clock, Mail, Phone } from 'lucide-react';
import PolicyNavigation from './policy-navigation';

export type PolicySection = { id: string; title: string; paragraphs: string[] };

export default function PolicyPage({ title, intro, sections }: { title: string; intro: string; sections: PolicySection[] }) {
  const privacy = title === 'Privacy Policy';
  const minutes = Math.max(1, Math.ceil(sections.flatMap((s) => s.paragraphs).join(' ').split(/\s+/).length / 200));
  return (
    <main id="main">
      <section className="policy-hero">
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>{title}</span></nav>
          <p className="eyebrow eyebrow-leaf">Prakruthi Aqua · Built on trust</p>
          <h1>{privacy ? <>Your privacy. <em>Our responsibility.</em></> : <>Clear terms. <em>Confident choices.</em></>}</h1>
          <p className="page-banner-lead">{intro}</p>
          <div className="policy-meta"><span><CalendarDays size={14} /> Updated 9 November 2026</span><span><Clock size={14} /> {minutes} min read</span></div>
          <div className="policy-switch">
            <Link href="/terms-and-conditions/" aria-current={!privacy ? 'page' : undefined}>Terms &amp; Conditions</Link>
            <Link href="/privacy-policy/" aria-current={privacy ? 'page' : undefined}>Privacy Policy</Link>
          </div>
        </div>
      </section>
      <div className="container policy-layout">
        <PolicyNavigation sections={sections.map(({ id, title }) => ({ id, title }))} />
        <div>
          <article className="policy-doc">
            {sections.map((s, i) => (
              <section className="policy-section" id={s.id} key={s.id}>
                <span className="policy-index">{String(i + 1).padStart(2, '0')}</span>
                <div><h2>{s.title}</h2>{s.paragraphs.map((p) => <p key={p}>{p}</p>)}</div>
              </section>
            ))}
          </article>
          <section className="dark-card policy-contact">
            <div>
              <h2>Still have a question?</h2>
              <p>Get in touch with the Prakruthi Aqua team.</p>
            </div>
            <div className="policy-contact-links">
              <a href="mailto:support@prakruthiaqua.in"><Mail size={15} /> support@prakruthiaqua.in</a>
              <a href="tel:+918904373735"><Phone size={15} /> +91 89043 73735</a>
              <Link className="btn btn-leaf" href="/contact/">Contact us <ArrowUpRight size={16} /></Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
