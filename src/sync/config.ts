/** Base URL for Phase B HTTP relay (no trailing slash). E.g. http://192.168.1.10:8765 */
export function getRelayBaseUrl(): string {
  const raw =
    typeof process !== 'undefined'
      ? (process as { env?: Record<string, string> }).env
          ?.EXPO_PUBLIC_EMBER_RELAY_URL ?? ''
      : '';
  return raw.replace(/\/$/, '').trim();
}
