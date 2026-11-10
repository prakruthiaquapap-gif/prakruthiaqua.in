'use client';
import { useState } from 'react';
import { ArrowUpRight, CheckCircle2, Send, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ContactForm() {
  const [status, setStatus] = useState(''), [busy, setBusy] = useState(false), [done, setDone] = useState(false), [fallback, setFallback] = useState('');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus(''); setFallback('');
    const f = new FormData(e.currentTarget);
    const subject = String(f.get('subject')).trim();
    const message = String(f.get('message')).trim();
    const type = new URLSearchParams(location.search).get('type') === 'Business enquiry' ? 'Business enquiry' : 'General enquiry';
    const entry = { name: String(f.get('name')).trim(), email: String(f.get('email')).trim(), phone: String(f.get('phone')).trim(), type, message: `Subject: ${subject}\n\n${message}` };
    if (!supabase) {
      const text = `Hi Prakruthi Aqua!\nSubject: ${subject}\nName: ${entry.name}\nEmail: ${entry.email}\nPhone: ${entry.phone}\n\n${message}`;
      setFallback(`https://wa.me/918904373735?text=${encodeURIComponent(text)}`);
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.from('prakruthi_enquiries').insert(entry);
      if (error) throw error;
      setDone(true);
    } catch {
      setStatus('Your message could not be saved. Please try again, call us, or email support@prakruthiaqua.in.');
    } finally { setBusy(false); }
  }

  if (done) {
    return (
      <div className="form-card form-success" role="status">
        <CheckCircle2 size={44} />
        <h2>Message received</h2>
        <p>Thank you for contacting Prakruthi Aqua. Our team will get back to you soon.</p>
        <button className="btn btn-outline" onClick={() => { setDone(false); setFallback(''); }}>Send another message <ArrowUpRight size={15} /></button>
      </div>
    );
  }

  return (
    <form className="form-card" onSubmit={submit}>
      <p className="eyebrow"><span className="dot" />We’re here to help</p>
      <h2>Send us a message</h2>
      <div className="fields">
        <label>Full name *<input name="name" autoComplete="name" required maxLength={100} placeholder="Your full name" /></label>
        <label>Email address *<input name="email" type="email" autoComplete="email" required maxLength={200} placeholder="you@example.com" /></label>
        <label>Phone number<input name="phone" type="tel" autoComplete="tel" maxLength={30} placeholder="Your phone number" /></label>
        <label>Subject *<input name="subject" required maxLength={200} placeholder="How can we help?" /></label>
        <label className="full">Message *<textarea name="message" required minLength={10} maxLength={3600} rows={6} placeholder="Tell us a little more…" /></label>
      </div>
      {status && <p role="alert" className="alert alert-error">{status}</p>}
      {fallback ? (
        <div className="alert" role="status">
          <p>Your message is ready. Send it through WhatsApp to complete your enquiry.</p>
          <div className="alert-actions">
            <a href={fallback} target="_blank" rel="noreferrer" className="btn btn-leaf"><MessageCircle size={16} /> Send via WhatsApp</a>
            <button type="button" className="btn btn-outline" onClick={() => setFallback('')}>Edit message</button>
          </div>
        </div>
      ) : (
        <button type="submit" className="btn btn-dark btn-lg" disabled={busy}>{busy ? 'Sending…' : 'Send message'} <Send size={16} /></button>
      )}
    </form>
  );
}
