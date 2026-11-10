import Link from 'next/link';
import { ArrowUpRight, ArrowDown } from 'lucide-react';

type Props = {
  label: string; eyebrow?: string; title: string; accent: string; description: string;
  image: string; imageAlt: string; inset?: string; insetAlt?: string;
  primaryLabel: string; primaryHref: string; secondaryLabel?: string; secondaryHref?: string; footer?: string;
};

export default function PageBanner(p: Props) {
  return (
    <section className="page-banner" aria-labelledby="page-banner-title">
      <img className="page-banner-bg" src={p.image} alt={p.imageAlt} fetchPriority="high" />
      <div className="page-banner-shade" />
      <div className="container page-banner-inner">
        <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>{p.label}</span></nav>
        <p className="eyebrow eyebrow-leaf">{p.eyebrow || p.label}</p>
        <h1 id="page-banner-title">{p.title} <em>{p.accent}</em></h1>
        <p className="page-banner-lead">{p.description}</p>
        <div className="page-banner-actions">
          <a className="btn btn-leaf" href={p.primaryHref}>{p.primaryLabel} <ArrowDown size={16} /></a>
          {p.secondaryHref && <Link className="btn btn-outline-light" href={p.secondaryHref}>{p.secondaryLabel} <ArrowUpRight size={16} /></Link>}
        </div>
        {p.footer && <p className="page-banner-foot">{p.footer.split('/').map((s) => s.trim()).join('  ·  ')}</p>}
      </div>
    </section>
  );
}
