import { decodeBase64, encodeBase64 } from 'tweetnacl-util';
import {
  encrypt,
  decrypt,
  encryptObject,
  decryptObject,
} from '@/crypto/encryption';

describe('encryption (NaCl secretbox)', () => {
  const key = new Uint8Array(32).fill(7);

  it('round-trips UTF-8 plaintext', () => {
    const message = 'Resilience — 耐力 — مرونة';
    const ciphertext = encrypt(message, key);
    expect(ciphertext).not.toContain(message);
    expect(decrypt(ciphertext, key)).toBe(message);
  });

  it('rejects wrong key length', () => {
    const short = new Uint8Array(16);
    expect(() => encrypt('x', short)).toThrow(/32 bytes/);
    expect(() => decrypt('YmFi', short)).toThrow(/32 bytes/);
  });

  it('fails decrypt with tampered ciphertext', () => {
    const ct = encrypt('hello', key);
    const bytes = decodeBase64(ct);
    bytes[bytes.length - 1] ^= 0xff;
    const tampered = encodeBase64(bytes);
    expect(() => decrypt(tampered, key)).toThrow();
  });

  it('round-trips encrypted objects', () => {
    const obj = { role: 'medic', qty: 42, nested: { ok: true } };
    const blob = encryptObject(obj, key);
    expect(decryptObject<typeof obj>(blob, key)).toEqual(obj);
  });
});
