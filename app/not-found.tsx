import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <main id="main" className="section">
      <div className="container not-found">
        <span className="not-found-code">404</span>
        <p className="eyebrow"><span className="dot" />Page not found</p>
        <h1>Let’s find your <em>way back.</em></h1>
        <p className="lead">This page doesn’t seem to exist. Try the shop or head home.</p>
        <div className="hero-actions">
          <Link className="btn btn-dark btn-lg" href="/shop/">Explore the shop <ArrowRight size={16} /></Link>
          <Link className="btn btn-outline btn-lg" href="/">Go home</Link>
        </div>
      </div>
    </main>
  );
}
