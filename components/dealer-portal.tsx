import { ArrowUpRight, Building2, Store, Truck } from 'lucide-react';

export const dealerPortalUrl = 'https://dealers.prakruthiaqua.in/';
export function DealerPortalCard({ compact = false }: { compact?: boolean }) {
  if (compact) return <div className="dealer-portal-compact">
    <div><Store size={20} /><strong>Want to become a dealer?</strong></div>
    <p>Dealer · Sub Dealer · Retailer Outlet</p>
    <a href={dealerPortalUrl} target="_blank" rel="noopener noreferrer">Register on the dealer portal <ArrowUpRight size={15} /></a>
    <small>Choose Register Now on the portal. Applications are reviewed by the dealer admin.</small>
  </div>;
  return <section className="section dealer-portal-section" aria-labelledby="dealer-portal-title"><div className="container">
    <div className="dealer-portal-heading"><div><p className="eyebrow">Join the Prakruthi Aqua network</p><h2 id="dealer-portal-title">Your business.<br /><em>A world of opportunity.</em></h2></div><p>Become part of our growing partner network. Register on our dedicated dealer portal and choose the partner type that fits your business.</p></div>
    <div className="dealer-portal-types">{[
      { title: 'Dealer', icon: Building2, description: 'Grow your business with Prakruthi Aqua products.' },
      { title: 'Sub Dealer', icon: Truck, description: 'Join our distribution and local partner network.' },
      { title: 'Retailer Outlet', icon: Store, description: 'Bring aquarium care to customers at your store.' },
    ].map(({ title, icon: Icon, description }) => <article key={title}><span className="icon-tile icon-tile-leaf"><Icon size={23} /></span><h3>{title}</h3><p>{description}</p></article>)}</div>
    <div className="dealer-portal-bottom"><div><strong>Register. Get reviewed. Grow together.</strong><p>Open the portal → Select Register Now → Complete your details → Await admin approval.</p></div><a href={dealerPortalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-dark">Become a dealer <ArrowUpRight size={16} /></a></div>
  </div></section>;
}
