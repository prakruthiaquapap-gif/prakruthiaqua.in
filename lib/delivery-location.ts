export type DeliveryPosition = { latitude: number; longitude: number; accuracy: number };

export function getDeliveryPosition(geolocation: Geolocation): Promise<DeliveryPosition> {
  return new Promise((resolve, reject) => geolocation.getCurrentPosition(
    ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy }),
    ({ code }) => reject(new Error(code === 1
      ? 'Location permission was denied. Allow location access in your browser or type your address below.'
      : code === 3 ? 'Finding your location took too long. Try again or enter your address manually.'
      : 'Your location is unavailable. Check that location services are enabled, or enter your address manually.')),
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
  ));
}

export async function getDeliveryArea(position: DeliveryPosition, signal: AbortSignal, fetcher: typeof fetch = fetch): Promise<string> {
  const { latitude, longitude } = position;
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) throw new Error('Your device returned an invalid location. Please enter your address manually.');
  // Client-only provider: called only with coordinates freshly granted by this device.
  const query = new URLSearchParams({ latitude: String(latitude), longitude: String(longitude), localityLanguage: 'en' });
  const response = await fetcher(`https://api.bigdatacloud.net/data/reverse-geocode-client?${query}`, { signal, referrerPolicy: 'strict-origin-when-cross-origin' });
  if (!response.ok) throw new Error('Location found, but the address lookup is unavailable. Please enter your delivery address below.');
  const data = await response.json();
  // Do not silently substitute an IP-based city for the location supplied by the device.
  if (typeof data.lookupSource === 'string' && /ip/i.test(data.lookupSource)) throw new Error('We could not confirm your GPS area. Please enter your delivery address manually.');
  const parts = [data.locality, data.city, data.principalSubdivision, data.postcode, data.countryName]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .map(value => value.trim());
  const address = [...new Set(parts)].join(', ');
  if (!address || address.length > 1000) throw new Error('Location found, but no usable address was returned. Please enter your address manually.');
  return address;
}
