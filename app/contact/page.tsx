import { Phone, Mail, MapPin, ArrowUpRight, Clock } from 'lucide-react';
import ContactForm from '@/components/contact-form';
import PageBanner from '@/components/page-banner';

export const metadata = { title: 'Contact Us', description: "We're here to help with all your aquarium care needs. Contact Prakruthi Aqua in Bengaluru." };
const mapQuery = '2nd Cross, Veera Sagar Main Road, Yelahanka New Town, Bengaluru, India';
const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

export default function Contact() {
  return (
    <main id="main">
      <PageBanner
        label="Contact"
        eyebrow="Get in touch"
        title="Let’s talk."
        accent="We’re here to help."
        description="Questions about a product, or need advice for your aquarium? Our team is ready to help."
        image="/images/water.jpg"
        imageAlt="A peaceful underwater aquarium scene"
        primaryLabel="Send a message"
        primaryHref="#contact-details"
        secondaryLabel="Explore the shop"
        secondaryHref="/shop/"
      />
      <section id="contact-details" className="section anchor">
        <div className="container contact-grid">
          <div className="contact-info">
            <p className="eyebrow"><span className="dot" />Your aquarium care partners</p>
            <h2>Get in <em>touch.</em></h2>
            <p className="lead">Reach us through any of these channels — or send a message and we’ll get back to you.</p>
            <div className="contact-cards">
              <article><span className="icon-tile"><Phone size={19} /></span><div><h3>Phone</h3><a href="tel:+918904373735">+91 89043 73735</a></div></article>
              <article><span className="icon-tile"><Mail size={19} /></span><div><h3>Email</h3><a href="mailto:info@prakruthiaqua.in">info@prakruthiaqua.in</a><a href="mailto:support@prakruthiaqua.in">support@prakruthiaqua.in</a></div></article>
              <article><span className="icon-tile"><MapPin size={19} /></span><div><h3>Address</h3><p>2nd Cross, Veera Sagar Main Road, Near Amba Bhavani Temple, Attur Layout, Chikkadinne, Yelahanka New Town, Bengaluru, India</p><a className="link-arrow" href={mapLink} target="_blank" rel="noreferrer">Get directions <ArrowUpRight size={14} /></a></div></article>
              <article><span className="icon-tile"><Clock size={19} /></span><div><h3>Business hours</h3><p>Mon – Fri: 9:00 AM – 6:00 PM<br />Saturday: 10:00 AM – 4:00 PM<br />Sunday: Closed</p></div></article>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
      <section className="section section-paper section-tight">
        <div className="container">
          <div className="section-head">
            <div><p className="eyebrow"><span className="dot" />Find us in Bengaluru</p><h2>Visit <em>us.</em></h2></div>
            <a className="link-arrow" href={mapLink} target="_blank" rel="noreferrer">Open in Google Maps <ArrowUpRight size={16} /></a>
          </div>
          <iframe className="map" loading="lazy" src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`} title="Prakruthi Aqua map location" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      </section>
    </main>
  );
}
