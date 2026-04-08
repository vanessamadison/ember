import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import {
  loadMeshSecurityChecklist,
  saveMeshSecurityChecklist,
  type MeshSecurityChecklistState,
} from '../mesh/meshSecurityChecklistPreference';

const MESHTASTIC_SECURITY_URL = 'https://meshtastic.org/docs/overview/security/';

const styles = StyleSheet.create({
  wrap: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333333',
    gap: 10,
  },
  lead: {
    fontSize: 12,
    color: '#a3a3a3',
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#525252',
    marginTop: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#171717',
  },
  boxOn: {
    borderColor: '#d4a574',
    backgroundColor: 'rgba(212, 165, 116, 0.15)',
  },
  check: {
    color: '#d4a574',
    fontSize: 14,
    fontWeight: '700',
  },
  label: {
    flex: 1,
    fontSize: 13,
    color: '#e5e5e5',
    lineHeight: 19,
  },
  sub: {
    fontSize: 11,
    color: '#737373',
    marginTop: 8,
    lineHeight: 16,
  },
  link: {
    fontSize: 12,
    color: '#93c5fd',
    textDecorationLine: 'underline',
    marginTop: 6,
  },
  reset: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingVertical: 6,
    paddingHorizontal: 0,
  },
  resetText: {
    fontSize: 12,
    color: '#a3a3a3',
  },
});

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

export default function MeshSecurityChecklist() {
  const [state, setState] = useState<MeshSecurityChecklistState | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const s = await loadMeshSecurityChecklist();
      if (!cancelled) setState(s);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = useCallback((key: RowKey) => {
    setState((prev) => {
      if (!prev) return prev;
      const next = { ...prev, [key]: !prev[key] };
      void saveMeshSecurityChecklist(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    const cleared: MeshSecurityChecklistState = {
      firmwareVerified: false,
      privatePskConfigured: false,
      unattendedRiskAck: false,
      rotationPlanAck: false,
    };
    setState(cleared);
    void saveMeshSecurityChecklist(cleared);
  }, []);

  if (!state) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.lead}>
        Node security (Meshtastic). EMBER does not set channel keys over BLE — configure radios with
        the Meshtastic app or flasher. Use this checklist as a pilot aid.
      </Text>
      {ROWS.map(({ key, text }) => {
        const on = state[key];
        return (
          <Pressable
            key={key}
            style={styles.row}
            onPress={() => toggle(key)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: on }}
          >
            <View style={[styles.box, on ? styles.boxOn : null]}>
              {on ? <Text style={styles.check}>✓</Text> : null}
            </View>
            <Text style={styles.label}>{text}</Text>
          </Pressable>
        );
      })}
      <Text style={styles.sub}>
        Full operator notes: docs/MESHTASTIC-NODE-SECURITY.md in the repo.
      </Text>
      <Text
        style={styles.link}
        onPress={() => void Linking.openURL(MESHTASTIC_SECURITY_URL)}
      >
        Meshtastic security overview (official)
      </Text>
      <Pressable style={styles.reset} onPress={reset}>
        <Text style={styles.resetText}>Clear checklist</Text>
      </Pressable>
    </View>
  );
}
