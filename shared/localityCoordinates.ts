export type MapCoordinate = { lat: number; lng: number };

const localities: Record<string, MapCoordinate> = {
  "colombo 01": { lat: 6.9344, lng: 79.8428 },
  "colombo 02": { lat: 6.9271, lng: 79.8561 },
  "colombo 03": { lat: 6.9042, lng: 79.8537 },
  "colombo 05": { lat: 6.8845, lng: 79.8737 },
  colombo: { lat: 6.9271, lng: 79.8612 },
  rajagiriya: { lat: 6.9067, lng: 79.8955 },
  kotte: { lat: 6.8941, lng: 79.9025 },
  galle: { lat: 6.0329, lng: 80.2168 },
  koggala: { lat: 5.9886, lng: 80.3273 },
  weligama: { lat: 5.9736, lng: 80.4297 },
  kandy: { lat: 7.2906, lng: 80.6337 },
  ampitiya: { lat: 7.2738, lng: 80.6473 },
  negombo: { lat: 7.2083, lng: 79.8358 },
  jaffna: { lat: 9.6615, lng: 80.0255 },
  matara: { lat: 5.9549, lng: 80.555 },
  "nuwara eliya": { lat: 6.9497, lng: 80.7891 },
};

export const sriLankaCenter: MapCoordinate = { lat: 7.8731, lng: 80.7718 };

export function localityCoordinate(location: string): MapCoordinate {
  const normalized = location.toLowerCase();
  const match = Object.keys(localities)
    .sort((a, b) => b.length - a.length)
    .find(name => normalized.includes(name));
  return match ? localities[match] : sriLankaCenter;
}
