import assert from 'node:assert/strict';
import { getDeliveryPosition, getDeliveryArea } from '../lib/delivery-location.ts';
let options;
const position = await getDeliveryPosition({ getCurrentPosition(ok, _error, settings) { options = settings; ok({ coords: { latitude: 13.1, longitude: 77.58, accuracy: 25 } }); } });
assert.equal(position.accuracy, 25);
assert.equal(options.maximumAge, 0);
assert.equal(options.enableHighAccuracy, true);
for (const [code, message] of [[1, /permission was denied/], [2, /unavailable/], [3, /too long/]]) {
 await assert.rejects(getDeliveryPosition({ getCurrentPosition(_ok, error) { error({ code }); } }), message);
}
const signal = new AbortController().signal;
let called = false;
const area = await getDeliveryArea(position, signal, async (url, settings) => {
 called = true;
 assert.equal(new URL(url).searchParams.get('latitude'), '13.1');
 assert.equal(settings.signal, signal);
 return { ok: true, json: async () => ({ lookupSource: 'reverseGeocoding', locality: 'Yelahanka', city: 'Bengaluru', principalSubdivision: 'Karnataka', postcode: '560064', countryName: 'India' }) };
});
assert(called);
assert.equal(area, 'Yelahanka, Bengaluru, Karnataka, 560064, India');
await assert.rejects(getDeliveryArea({ ...position, latitude: NaN }, signal, async () => { throw Error('Must not call provider'); }), /invalid location/);
await assert.rejects(getDeliveryArea(position, signal, async () => ({ ok: false })), /lookup is unavailable/);
await assert.rejects(getDeliveryArea(position, signal, async () => ({ ok: true, json: async () => ({ lookupSource: 'ipGeolocation', city: 'Unconfirmed city' }) })), /could not confirm/);
await assert.rejects(getDeliveryArea(position, signal, async () => ({ ok: true, json: async () => ({ locality: null, city: 123 }) })), /no usable address/);
const duplicate = await getDeliveryArea(position, signal, async () => ({ ok: true, json: async () => ({ locality: 'Bengaluru', city: 'Bengaluru', countryName: 'India' }) }));
assert.equal(duplicate, 'Bengaluru, India');
console.log('Passed delivery-location checks: current GPS, permission errors, coordinate validation, address formatting, provider failure, IP fallback rejection and incomplete data. No real locations or external requests used.');
