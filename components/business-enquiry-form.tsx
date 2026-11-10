'use client';
import { useState } from 'react';
import { ArrowUpRight, MessageCircle, Check } from 'lucide-react';

const interests = ['Premium Fish Food', 'Health Supplements', 'Medications', 'Plant Fertilizers', 'Root Tabs', 'Liquid Fertilizers', 'Water Conditioners', 'Test Kits', 'Equipment'];

export default function BusinessEnquiryForm() {
  const [prepared, setPrepared] = useState('');
  function prepare(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const selected = f.getAll('products').map(String);
    const text = [
      'Hello Prakruthi Aqua, I would like to make a business enquiry.', '',
      `Business Name: ${String(f.get('business')).trim()}`,
      `Contact Person: ${String(f.get('person')).trim()}`,
      `Email Address: ${String(f.get('email')).trim()}`,
      `Phone Number: ${String(f.get('phone')).trim()}`,
      `Business Type: ${f.get('type')}`, '',
      `Interested Products: ${selected.length ? selected.join(', ') : 'Not specified'}`, '',
      `Additional Information:\n${String(f.get('information')).trim()}`,
    ].join('\n');
    setPrepared(`https://wa.me/918904373735?text=${encodeURIComponent(text)}`);
  }
  return (
    <form className="form-card" onSubmit={prepare} onChange={() => { if (prepared) setPrepared(''); }}>
      <div className="form-head">
        <span className="icon-tile icon-tile-leaf"><MessageCircle size={20} /></span>
        <div><p className="eyebrow">Let’s start a partnership</p><h2>Send enquiry via WhatsApp</h2></div>
      </div>
      <div className="fields">
        <label>Business name *<input name="business" required maxLength={150} autoComplete="organization" placeholder="Your business name" /></label>
        <label>Contact person *<input name="person" required maxLength={100} autoComplete="name" placeholder="Full name" /></label>
        <label>Email address *<input name="email" type="email" required maxLength={200} autoComplete="email" placeholder="you@business.com" /></label>
        <label>Phone number *<input name="phone" type="tel" required maxLength={30} autoComplete="tel" placeholder="Your contact number" /></label>
        <label className="full">Business type *
          <select name="type" required defaultValue="">
            <option value="" disabled>Select business type</option>
            {['Retailer', 'Wholesaler', 'Distributor', 'Aquarium Service Provider', 'Online Store', 'Other'].map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
        <fieldset className="full">
          <legend>Interested products <span>(select all that apply)</span></legend>
          <div className="checks">
            {interests.map((i) => (
              <label key={i} className="check"><input type="checkbox" name="products" value={i} /><span className="check-box"><Check size={13} strokeWidth={3} /></span><span>{i}</span></label>
            ))}
          </div>
        </fieldset>
        <label className="full">Additional information *<textarea name="information" required maxLength={3000} rows={5} placeholder="Tell us about your business and requirements…" /></label>
      </div>
      {prepared ? (
        <div className="alert" role="status">
          <p>Your enquiry is ready. Open WhatsApp, review the message and send it to Prakruthi Aqua.</p>
          <div className="alert-actions">
            <a href={prepared} target="_blank" rel="noreferrer" className="btn btn-leaf"><MessageCircle size={16} /> Open WhatsApp &amp; send <ArrowUpRight size={15} /></a>
            <button type="button" className="btn btn-outline" onClick={() => setPrepared('')}>Edit enquiry</button>
          </div>
        </div>
      ) : (
        <button type="submit" className="btn btn-dark btn-lg"><MessageCircle size={17} /> Send enquiry via WhatsApp <ArrowUpRight size={16} /></button>
      )}
      <p className="fine">Your enquiry opens in WhatsApp for you to review and send. This form does not place an order.</p>
    </form>
  );
}
