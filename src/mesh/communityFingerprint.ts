import * as Crypto from 'expo-crypto';

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

/**
 * Deterministic 16-byte community handle for mesh envelope v1 (not secret).
 * Prefix separates this use from other SHA-256 inputs in the app.
 */
export async function communityMeshFingerprint16(
  communityId: string
): Promise<Uint8Array> {
  const hex = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `ember-mesh-v1:${communityId}`,
    { encoding: Crypto.CryptoEncoding.HEX }
  );
  return hexToBytes(hex).subarray(0, 16);
}
