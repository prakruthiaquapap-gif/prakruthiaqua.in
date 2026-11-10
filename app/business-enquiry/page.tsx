import { DealerPortalCard } from '@/components/dealer-portal';
import { MessageCircle, ArrowUpRight, Store, Truck, Building2 } from 'lucide-react';
import Link from 'next/link';
import PageBanner from '@/components/page-banner';
import BusinessEnquiryForm from '@/components/business-enquiry-form';

export const metadata = { title: 'Business Enquiry', description: 'Enquire about Prakruthi Aqua products for your retail, wholesale, distribution or aquarium service business.' };

export default function BusinessEnquiry() {
  return (
    <main id="main">
      <PageBanner
        label="Business Enquiry"
        eyebrow="Grow something good, together"
        title="Your business."
        accent="Our shared passion."
        description="Connect with Prakruthi Aqua about products for your store, distribution network or aquarium service business."
        image="/images/plants.jpg"
        imageAlt="A flourishing underwater garden"
        primaryLabel="Send an enquiry"
        primaryHref="#business-form"
        secondaryLabel="Explore products"
        secondaryHref="/shop/"
      />
      <DealerPortalCard />
      <section id="business-form" className="section anchor">
        <div className="container business-grid">
          <aside className="business-aside">
            <p className="eyebrow"><span className="dot" />Partners in aquatic care</p>
            <h2>Let’s grow <em>together.</em></h2>
            <p className="lead">Tell us about your business, the products you’re interested in, and how we can help.</p>
            <ul className="who-list">
              <li><span className="icon-tile icon-tile-leaf"><Store size={18} /></span>Retailers &amp; online stores</li>
              <li><span className="icon-tile icon-tile-leaf"><Truck size={18} /></span>Wholesalers &amp; distributors</li>
              <li><span className="icon-tile icon-tile-leaf"><Building2 size={18} /></span>Aquarium service providers</li>
            </ul>
            <div className="dark-card">
              <MessageCircle size={22} />
              <h3>Prefer a direct conversation?</h3>
              <p>Call or WhatsApp our team.</p>
              <a href="tel:+918904373735" className="link-arrow link-arrow-light">+91 89043 73735 <ArrowUpRight size={15} /></a>
            </div>
            <Link className="link-arrow" href="/contact/">Other ways to connect <ArrowUpRight size={14} /></Link>
          </aside>
          <BusinessEnquiryForm />
        </div>
      </section>
    </main>
  );
}
