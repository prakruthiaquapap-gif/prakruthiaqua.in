'use client';
import { useEffect, useRef, useState } from 'react';
import { LocateFixed, LoaderCircle, MapPin } from 'lucide-react';
import { getDeliveryArea, getDeliveryPosition } from '@/lib/delivery-location';

export default function DeliveryLocation() {
  const [address, setAddress] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const request = useRef(0);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => { request.current++; controller.current?.abort(); }, []);

  async function locate() {
    if (busy) return;
    setError(''); setStatus('');
    if (!window.isSecureContext) { setError('Location requires a secure connection. Use HTTPS or enter your address manually.'); return; }
    if (!navigator.geolocation) { setError('Your browser does not support location. Please enter your address manually.'); return; }
    const id = ++request.current;
    controller.current?.abort();
    setBusy(true); setStatus('Finding your current location…');
    try {
      const position = await getDeliveryPosition(navigator.geolocation);
      if (id !== request.current) return;
      setStatus('Location found. Looking up your area…');
      const abort = new AbortController();
      controller.current = abort;
      const timeout = window.setTimeout(() => abort.abort(), 12000);
      let area: string;
      try { area = await getDeliveryArea(position, abort.signal); }
      finally { window.clearTimeout(timeout); }
      if (id !== request.current) return;
      setAddress(area);
      setStatus(position.accuracy > 1000
        ? 'Your device gave an approximate location. Check the area and PIN code, and add your house number and street.'
        : 'Area added. Please add your house number, building and street, and check the PIN code before ordering.');
    } catch (failure) {
      if (id !== request.current) return;
      setStatus('');
      setError(failure instanceof Error && failure.name !== 'AbortError' && failure.name !== 'TypeError'
        ? failure.message : 'We couldn’t look up your area. Try again or enter your full address manually.');
    } finally { if (id === request.current) setBusy(false); }
  }

  return <div className="full delivery-location">
    <div className="delivery-location-head"><span><MapPin size={17} /> Delivery address</span><button type="button" className="delivery-location-button" disabled={busy} onClick={() => void locate()}>{busy ? <LoaderCircle size={16} className="delivery-location-spinner" /> : <LocateFixed size={16} />}{busy ? 'Finding location…' : 'Use my current location'}</button></div>
    <p className="delivery-location-privacy" id="delivery-location-privacy">Optional: allow browser location access to find your area. Your coordinates are sent to <a href="https://www.bigdatacloud.com/privacy-and-cookie-policy" target="_blank" rel="noopener noreferrer">BigDataCloud</a> for the lookup.</p>
    <label>Full delivery address *<textarea name="address" required minLength={10} maxLength={1000} rows={4} autoComplete="street-address" aria-describedby="delivery-location-privacy delivery-location-help" placeholder="House / flat number, building, street, area, city, state and PIN code" value={address} onChange={e => {
      // Manual edits always win over an in-flight location lookup.
      request.current++; controller.current?.abort(); setBusy(false); setError(''); setStatus(''); setAddress(e.target.value);
    }} /></label>
    <p className="delivery-location-help" id="delivery-location-help">You can always type or edit your address. Location lookup does not identify your exact house or flat.</p>
    <div aria-live="polite" aria-atomic="true">{status && <p className="delivery-location-status">{status}</p>}{error && <p className="delivery-location-error" role="alert">{error}</p>}</div>
  </div>;
}
