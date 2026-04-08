/**
 * Web React port of the EMBER app Mesh Security Checklist (Settings → Mesh Network).
 * Self-contained: drop into any React 18+ project (Vite, Next, Docusaurus client component).
 *
 * Persistence: localStorage key `ember_mesh_security_checklist_v1` (same key name as the native app’s AsyncStorage).
 */
import React, { useCallback, useState } from 'react';

const STORAGE_KEY = 'ember_mesh_security_checklist_v1';
const MESHTASTIC_SECURITY_URL = 'https://meshtastic.org/docs/overview/security/';

export type MeshSecurityChecklistState = {
  firmwareVerified: boolean;
  privatePskConfigured: boolean;
  unattendedRiskAck: boolean;
  rotationPlanAck: boolean;
};

const DEFAULT_STATE: MeshSecurityChecklistState = {
  firmwareVerified: false,
  privatePskConfigured: false,
  unattendedRiskAck: false,
  rotationPlanAck: false,
};

function parseState(raw: string | null): MeshSecurityChecklistState {
  if (!raw) return { ...DEFAULT_STATE };
  try {
    const o = JSON.parse(raw) as Partial<MeshSecurityChecklistState>;
    return {
      firmwareVerified: Boolean(o.firmwareVerified),
      privatePskConfigured: Boolean(o.privatePskConfigured),
      unattendedRiskAck: Boolean(o.unattendedRiskAck),
      rotationPlanAck: Boolean(o.rotationPlanAck),
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

type RowKey = keyof MeshSecurityChecklistState;

const ROWS: { key: RowKey; text: string }[] = [
  {
    key: 'firmwareVerified',
    text:
      'Meshtastic firmware is 2.5.0 or newer on every node (check in Meshtastic app or flasher).',
  },
  {
    key: 'privatePskConfigured',
    text:
      'Primary channel uses a private PSK — not the default — and matches on all nodes (name + modem preset + PSK).',
  },
  {
    key: 'unattendedRiskAck',
    text:
      'I understand unattended / public router nodes can expose channel keys if someone gets physical access.',
  },
  {
    key: 'rotationPlanAck',
    text:
      'If a node is lost or stolen, we will rotate the channel key and re-provision remaining devices.',
  },
];

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    marginTop: 12,
    paddingTop: 12,
    borderTop: '1px solid #333',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    maxWidth: 520,
    fontFamily: 'system-ui, sans-serif',
  },
  lead: {
    fontSize: 12,
    color: '#a3a3a3',
    lineHeight: 1.5,
    margin: 0,
  },
  row: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
    padding: 0,
    textAlign: 'left',
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 4,
    border: '1px solid #525252',
    marginTop: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#171717',
    flexShrink: 0,
  },
  boxOn: {
    borderColor: '#d4a574',
    backgroundColor: 'rgba(212, 165, 116, 0.15)',
  },
  check: {
    color: '#d4a574',
    fontSize: 14,
    fontWeight: 700,
  },
  label: {
    flex: 1,
    fontSize: 13,
    color: '#e5e5e5',
    lineHeight: 1.45,
  },
  sub: {
    fontSize: 11,
    color: '#737373',
    marginTop: 8,
    lineHeight: 1.45,
  },
  link: {
    fontSize: 12,
    color: '#93c5fd',
    textDecoration: 'underline',
    marginTop: 6,
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    textAlign: 'left',
  },
  reset: {
    alignSelf: 'flex-start',
    marginTop: 4,
    padding: '6px 0',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  resetText: {
    fontSize: 12,
    color: '#a3a3a3',
  },
};

function readInitialState(): MeshSecurityChecklistState {
  if (typeof window === 'undefined') return { ...DEFAULT_STATE };
  return parseState(window.localStorage.getItem(STORAGE_KEY));
}

export default function MeshSecurityChecklistWeb() {
  const [state, setState] = useState<MeshSecurityChecklistState>(() => readInitialState());

  const persist = useCallback((next: MeshSecurityChecklistState) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  }, []);

  const toggle = useCallback(
    (key: RowKey) => {
      setState((prev) => {
        const next = { ...prev, [key]: !prev[key] };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const reset = useCallback(() => {
    const cleared = { ...DEFAULT_STATE };
    setState(cleared);
    persist(cleared);
  }, [persist]);

  return (
    <section style={styles.wrap} aria-label="Meshtastic node security checklist">
      <p style={styles.lead}>
        Node security (Meshtastic). EMBER does not set channel keys over BLE — configure radios with
        the Meshtastic app or flasher. Use this checklist as a pilot aid.
      </p>
      {ROWS.map(({ key, text }) => {
        const on = state[key];
        return (
          <button
            key={key}
            type="button"
            style={styles.row}
            onClick={() => toggle(key)}
            aria-pressed={on}
          >
            <span style={{ ...styles.box, ...(on ? styles.boxOn : {}) }}>
              {on ? <span style={styles.check}>✓</span> : null}
            </span>
            <span style={styles.label}>{text}</span>
          </button>
        );
      })}
      <p style={styles.sub}>
        Full operator notes:{' '}
        <a href="../../MESHTASTIC-NODE-SECURITY.md" style={{ color: '#93c5fd' }}>
          MESHTASTIC-NODE-SECURITY.md
        </a>{' '}
        in the EMBER repo (relative link for static docs; adjust for your site).
      </p>
      <a href={MESHTASTIC_SECURITY_URL} style={{ ...styles.link, display: 'inline-block' }}>
        Meshtastic security overview (official)
      </a>
      <button type="button" style={styles.reset} onClick={reset}>
        <span style={styles.resetText}>Clear checklist</span>
      </button>
    </section>
  );
}
