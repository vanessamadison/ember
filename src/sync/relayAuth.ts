import * as Crypto from 'expo-crypto';

function normalizeInvite(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, '');
}

/**
 * Shared relay auth token: both devices derive the same value from the community
 * passphrase hash (already stored on the community) + normalized invite code.
 * The relay never receives the raw passphrase.
 */
export async function buildRelayAuthToken(
  passphraseHashHex: string,
  inviteCode: string
): Promise<string> {
  const invite = normalizeInvite(inviteCode);
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${passphraseHashHex}:${invite}`,
    { encoding: Crypto.CryptoEncoding.HEX }
  );
}
