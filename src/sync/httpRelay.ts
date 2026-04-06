import { normalizeInviteCode } from '../db/communityLifecycle';
import { buildRelayAuthToken } from './relayAuth';
import { getRelayBaseUrl } from './config';

export async function relayPullBundle(
  inviteCode: string,
  passphraseHashHex: string
): Promise<string | null> {
  const invite = normalizeInviteCode(inviteCode);
  const base = getRelayBaseUrl();
  if (!base) {
    throw new Error(
      'Relay URL is not configured. Set EXPO_PUBLIC_EMBER_RELAY_URL (e.g. http://your-lan-ip:8765).'
    );
  }

  const token = await buildRelayAuthToken(passphraseHashHex, invite);
  const res = await fetch(
    `${base}/v1/communities/${encodeURIComponent(invite)}/bundle`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Ember-Passphrase-Hash': passphraseHashHex,
      },
    }
  );

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Relay pull failed (${res.status}).`);
  }

  const body: unknown = await res.json();
  if (
    !body ||
    typeof body !== 'object' ||
    !('ciphertext' in body) ||
    typeof (body as { ciphertext: unknown }).ciphertext !== 'string'
  ) {
    return null;
  }
  return (body as { ciphertext: string }).ciphertext;
}

export async function relayPushBundle(
  inviteCode: string,
  passphraseHashHex: string,
  ciphertext: string
): Promise<void> {
  const invite = normalizeInviteCode(inviteCode);
  const base = getRelayBaseUrl();
  if (!base) {
    throw new Error(
      'Relay URL is not configured. Set EXPO_PUBLIC_EMBER_RELAY_URL (e.g. http://your-lan-ip:8765).'
    );
  }

  const token = await buildRelayAuthToken(passphraseHashHex, invite);
  const res = await fetch(
    `${base}/v1/communities/${encodeURIComponent(invite)}/bundle`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-Ember-Passphrase-Hash': passphraseHashHex,
      },
      body: JSON.stringify({ ciphertext }),
    }
  );

  if (!res.ok) {
    throw new Error(`Relay push failed (${res.status}).`);
  }
}
