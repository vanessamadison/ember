#!/usr/bin/env node
/**
 * Dev-only Phase B relay: stores latest ciphertext bundle per invite code.
 * Auth: Authorization: Bearer sha256_hex(passphrase_hash + ":" + invite_code_normalized)
 * Headers: X-Ember-Passphrase-Hash (hex), invite in URL path (uppercase normalized on client).
 *
 *   node relay/dev-server.mjs
 *   # default http://0.0.0.0:8765
 *
 * iOS simulator can use host machine via your LAN IP (not localhost).
 */

import http from 'node:http';
import { createHash } from 'node:crypto';

const PORT = Number(process.env.EMBER_RELAY_PORT || 8765);
/** @type {Map<string, { ciphertext: string }>} */
const store = new Map();

function expectedToken(passphraseHash, inviteNorm) {
  return createHash('sha256')
    .update(`${passphraseHash}:${inviteNorm}`, 'utf8')
    .digest('hex');
}

function parseInvite(pathname) {
  const m = pathname.match(/^\/v1\/communities\/([^/]+)\/bundle\/?$/);
  return m ? decodeURIComponent(m[1]) : null;
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Ember-Passphrase-Hash'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  const invite = parseInvite(url.pathname);
  if (!invite) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'not_found' }));
    return;
  }

  const inviteNorm = invite.trim().toUpperCase().replace(/\s+/g, '');
  const auth = req.headers.authorization;
  const bearer =
    typeof auth === 'string' && auth.startsWith('Bearer ')
      ? auth.slice(7).trim()
      : '';
  const passHash =
    typeof req.headers['x-ember-passphrase-hash'] === 'string'
      ? req.headers['x-ember-passphrase-hash'].trim()
      : '';

  const want = expectedToken(passHash, inviteNorm);
  if (!bearer || bearer !== want) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'unauthorized' }));
    return;
  }

  const key = inviteNorm;

  if (req.method === 'GET') {
    const row = store.get(key);
    if (!row) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'no_bundle' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ciphertext: row.ciphertext }));
    return;
  }

  if (req.method === 'PUT') {
    let body = '';
    req.on('data', (c) => {
      body += c;
    });
    req.on('end', () => {
      try {
        const json = JSON.parse(body);
        if (typeof json.ciphertext !== 'string') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'invalid_body' }));
          return;
        }
        store.set(key, { ciphertext: json.ciphertext });
        res.writeHead(204);
        res.end();
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'bad_json' }));
      }
    });
    return;
  }

  res.writeHead(405, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'method_not_allowed' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`EMBER Phase B relay listening on http://0.0.0.0:${PORT}`);
});
