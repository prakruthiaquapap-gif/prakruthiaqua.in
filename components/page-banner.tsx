import Link from 'next/link';
import { ArrowUpRight, ArrowDown, ArrowRight, Leaf } from 'lucide-react';

type Disc = { image: string; alt?: string; name?: string; price?: string; href?: string; label?: string; logo?: boolean };

type Props = {
  label: string; eyebrow?: string; title: string; accent: string; description: string;
  image?: string; imageAlt?: string; inset?: string; insetAlt?: string; tag?: string;
  primaryLabel?: string; primaryHref?: string; secondaryLabel?: string; secondaryHref?: string;
  points?: string[]; compact?: boolean;
  disc?: Disc; stats?: [string, string][]; links?: [string, string][];
};

export default function PageBanner(p: Props) {
  const crumbs = <nav className="crumbs crumbs-dark" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>{p.label}</span></nav>;

  if (p.compact || !p.image) {
    return (
      <section className="page-hero page-hero-compact" aria-labelledby="page-hero-title">
        <div className="container">
          {crumbs}
          <div className="page-hero-row">
            <div>
              <p className="eyebrow"><span className="dot" />{p.eyebrow || p.label}</p>
              <h1 id="page-hero-title">{p.title} <em>{p.accent}</em></h1>
            </div>
            <div className="page-hero-side">
              <p className="lead">{p.description}</p>
              {(p.primaryHref || p.secondaryHref) && (
                <div className="hero-actions">
                  {p.primaryHref && <a className="btn btn-dark" href={p.primaryHref}>{p.primaryLabel} <ArrowDown size={16} /></a>}
                  {p.secondaryHref && <Link className="btn btn-outline" href={p.secondaryHref}>{p.secondaryLabel} <ArrowUpRight size={16} /></Link>}
                </div>
              )}
            </div>
          </div>
          {p.points && <ul className="page-hero-points">{p.points.map((x) => <li key={x}><Leaf size={13} /> {x}</li>)}</ul>}
        </div>
      </section>
    );
  }

  const disc = p.disc || (p.inset ? { image: p.inset, alt: p.insetAlt, photo: true } : undefined);
  const discIsPhoto = !p.disc && !!p.inset;

  return (
    <section className="bn pb" aria-labelledby="page-hero-title">
      <div className="bn-deco" aria-hidden="true">
        <span className="bn-shape" />
        <img className="bn-watermark" src="/images/prakruthi-icon.svg" alt="" />
      </div>

      <div className="container bn-grid">
        <div className="bn-copy">
          {crumbs}
          <p className="bn-eyebrow"><Leaf size={13} /> {p.eyebrow || p.label}</p>
          <h1 id="page-hero-title">{p.title} <em>{p.accent}</em></h1>
          <p className="bn-lead">{p.description}</p>
          <div className="bn-actions">
            {p.primaryHref && <a className="btn btn-dark btn-lg" href={p.primaryHref}>{p.primaryLabel} <ArrowDown size={16} /></a>}
            {p.secondaryHref && <Link className="link-line" href={p.secondaryHref}>{p.secondaryLabel} <ArrowRight size={14} /></Link>}
          </div>
          {p.stats && (
            <ul className="bn-stats">
              {p.stats.map(([v, l]) => <li key={l}><b>{v}</b><span>{l}</span></li>)}
            </ul>
          )}
        </div>

        <div className="bn-stage">
          <div className="bn-arch"><img className="is-visible" src={p.image} alt={p.imageAlt || ''} fetchPriority="high" /></div>
          {disc && (
            <div className={`bn-disc${discIsPhoto ? ' bn-disc-photo' : ''}${p.disc?.logo ? ' bn-disc-logo' : ''}`}>
              <img src={disc.image} alt={disc.alt || ''} />
            </div>
          )}
          {p.disc?.name && (
            p.disc.href
              ? <Link href={p.disc.href} className="bn-price"><span><small>{p.disc.label || 'Featured'}</small><b>{p.disc.name}</b>{p.disc.price && <i>{p.disc.price}</i>}</span><span className="bn-price-go"><ArrowUpRight size={16} /></span></Link>
              : <span className="bn-price"><span><small>{p.disc.label || 'Featured'}</small><b>{p.disc.name}</b>{p.disc.price && <i>{p.disc.price}</i>}</span></span>
          )}
          {!p.disc?.name && p.tag && <span className="bn-price"><span><small>Prakruthi Aqua</small><b>{p.tag}</b></span></span>}
          <span className="bn-badge" aria-hidden="true">
            <svg viewBox="0 0 120 120">
              <defs><path id="pb-circle" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" /></defs>
              <text><textPath href="#pb-circle" textLength="286" lengthAdjust="spacing">PRAKRUTHI AQUA ✦ MADE IN BENGALURU ✦</textPath></text>
            </svg>
            <img src="/images/prakruthi-icon.svg" alt="" />
          </span>
        </div>
      </div>

      {(p.links || p.points) && (
        <div className="container bn-nav pb-nav">
          <div className="pb-links">
            {p.links
              ? p.links.map(([l, h]) => <Link key={h} href={h}><Leaf size={13} /> {l}</Link>)
              : p.points!.map((x) => <span key={x}><Leaf size={13} /> {x}</span>)}
          </div>
        </div>
      )}
    </section>
  );
}
