import * as Crypto from 'expo-crypto';

/** RFC 4122 v4 using expo-crypto (works on native + web). */
export function randomUuid(): string {
  const bytes = Crypto.getRandomBytes(16);
  const b = [...bytes];
  b[6] = (b[6]! & 0x0f) | 0x40;
  b[8] = (b[8]! & 0x3f) | 0x80;
  const hex = b.map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
