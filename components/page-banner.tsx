import Link from 'next/link';
import { ArrowUpRight, ArrowDown, ArrowRight, Leaf } from 'lucide-react';
import { Bubbles, Caustics, LightRays, Wave } from './aquatic-fx';
import FitScreen from './fit-screen';

type Disc = { image: string; alt?: string; name?: string; price?: string; href?: string; label?: string; logo?: boolean; photo?: boolean };

type Props = {
  label: string; eyebrow?: string; title: string; accent: string; description: string;
  backdropImage?: string; image?: string; imageAlt?: string; inset?: string; insetAlt?: string; tag?: string;
  primaryLabel?: string; primaryHref?: string; secondaryLabel?: string; secondaryHref?: string;
  points?: string[]; compact?: boolean; variant?: 'story';
  disc?: Disc; stats?: [string, string][]; links?: [string, string][];
};

/** Shared deep-water backdrop for every inner-page hero. */
export function HeroBackdrop({ word }: { word?: string }) {
  return (
    <div className="ph-bg" aria-hidden="true">
      <span className="ph-glow" />
      <LightRays className="ph-rays" />
      <Caustics className="ph-caustics" />
      <Bubbles count={14} className="ph-bubbles" />
      {word && <span className="ph-word">{word}</span>}
    </div>
  );
}

export default function PageBanner(p: Props) {
  const crumbs = <nav className="ph-crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span>{p.label}</span></nav>;
  const eyebrow = <p className="ph-eyebrow"><i aria-hidden="true" />{p.eyebrow || p.label}</p>;
  const title = <h1 id="page-hero-title" className="ph-title">{p.title} <em>{p.accent}</em></h1>;
  const actions = (p.primaryHref || p.secondaryHref) && (
    <div className="ph-actions">
      {p.primaryHref && <a className="aqx-cta ph-cta" href={p.primaryHref}><span>{p.primaryLabel}</span><i><ArrowDown size={17} /></i></a>}
      {p.secondaryHref && (p.primaryHref
        ? <Link className="ph-link" href={p.secondaryHref}>{p.secondaryLabel} <ArrowRight size={15} /></Link>
        : <Link className="aqx-cta ph-cta" href={p.secondaryHref}><span>{p.secondaryLabel}</span><i><ArrowUpRight size={17} /></i></Link>)}
    </div>
  );

  if (p.variant === 'story') return <section className="story-banner" aria-labelledby="page-hero-title">
    <img className="story-banner-photo" src={p.image} alt={p.imageAlt || ''} fetchPriority="high" />
    <div className="container story-banner-inner story-banner-editorial">
      <nav className="story-banner-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><ArrowRight size={12} aria-hidden="true"/><span>{p.label}</span></nav>
      <div className="story-banner-content">
        <div className="story-banner-heading"><p className="story-banner-origin"><Leaf size={13}/>{p.eyebrow || p.label}</p>{title}</div>
        <div className="story-banner-details"><p className="story-banner-description">{p.description}</p><div className="story-banner-buttons">
          {p.primaryHref && <a className="story-banner-primary" href={p.primaryHref}>{p.primaryLabel}<ArrowDown size={16}/></a>}
          {p.secondaryHref && <Link className="story-banner-secondary" href={p.secondaryHref}>{p.secondaryLabel}<ArrowUpRight size={16}/></Link>}
        </div></div>
      </div>
    </div>
  </section>;

  if (p.compact || !p.image) {
    return (
      <section className={`ph ph-compact${p.backdropImage ? ' ph-image-banner' : ''}`} aria-labelledby="page-hero-title">
        {p.backdropImage && <><img className="ph-backdrop-photo" src={p.backdropImage} alt="" fetchPriority="high"/><span className="ph-backdrop-shade" aria-hidden="true"/></>}
        <HeroBackdrop word={p.label} />
        <div className="container ph-compact-inner">
          {crumbs}
          <div className="ph-compact-row">
            <div>{eyebrow}{title}</div>
            <div className="ph-compact-side">
              <p className="ph-lead">{p.description}</p>
              {actions}
            </div>
          </div>
          {p.points && <ul className="ph-points">{p.points.map((x) => <li key={x}><Leaf size={13} /> {x}</li>)}</ul>}
        </div>
        <Wave className="ph-wave" />
      </section>
    );
  }

  const disc = p.disc || (p.inset ? { image: p.inset, alt: p.insetAlt } : undefined);
  const discKind = p.disc?.logo ? ' is-logo' : p.disc?.photo || (!p.disc && p.inset) ? ' is-photo' : '';
  const card = p.disc?.name
    ? { label: p.disc.label || 'Featured', name: p.disc.name, sub: p.disc.price, href: p.disc.href }
    : p.tag ? { label: 'Prakruthi Aqua', name: p.tag, sub: undefined, href: undefined } : null;
  const cardInner = card && (
    <>
      <span className="ph-card-text"><small>{card.label}</small><b>{card.name}</b>{card.sub && <i>{card.sub}</i>}</span>
      {card.href && <span className="ph-card-go"><ArrowUpRight size={16} /></span>}
    </>
  );

  return (
    <section className="ph" aria-labelledby="page-hero-title">
      <FitScreen />
      <HeroBackdrop word={p.label} />

      <div className="container ph-grid">
        <div className="ph-copy">
          {crumbs}
          {eyebrow}
          {title}
          <p className="ph-lead">{p.description}</p>
          {actions}
          {p.stats && (
            <ul className="ph-stats">
              {p.stats.map(([v, l]) => <li key={l}><b>{v}</b><span>{l}</span></li>)}
            </ul>
          )}
        </div>

        <div className="ph-stage">
          <span className="ph-ring" aria-hidden="true" />
          <div className="ph-window">
            {/* Inner layer is hard-clipped to the arch (clip-path), so Safari never shows square corners. */}
            <div className="ph-window-clip">
              <img src={p.image} alt={p.imageAlt || ''} fetchPriority="high" />
              <Caustics />
              <Bubbles count={8} />
              <span className="ph-glass" aria-hidden="true" />
            </div>
          </div>
          {disc && (
            <div className={`ph-disc${discKind}`}>
              <span className="ph-disc-clip"><img src={disc.image} alt={disc.alt || ''} /></span>
            </div>
          )}
          {card && (card.href
            ? <Link href={card.href} className="ph-card">{cardInner}</Link>
            : <span className="ph-card">{cardInner}</span>)}
          <span className="ph-badge" aria-hidden="true">
            <svg viewBox="0 0 120 120">
              <defs><path id="ph-circle" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" /></defs>
              <text><textPath href="#ph-circle" textLength="286" lengthAdjust="spacing">PRAKRUTHI AQUA ✦ MADE IN BENGALURU ✦</textPath></text>
            </svg>
            <img src="/images/prakruthi-icon.svg" alt="" />
          </span>
        </div>
      </div>

      {(p.links || p.points) && (
        <div className={`container ph-chips${p.links ? '' : ' is-info'}`}>
          {p.links
            ? p.links.map(([l, h]) => <Link key={h} href={h}><Leaf size={13} /> {l}</Link>)
            : p.points!.map((x) => <span key={x}><Leaf size={13} /> {x}</span>)}
        </div>
      )}
      <Wave className="ph-wave" />
    </section>
  );
}
