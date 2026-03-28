import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmberLogo } from '../../src/components';
import { useApp } from '../../src/context/AppContext';
import { getTheme } from '../../src/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  profileCard: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#d4a574',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  profileDetail: {
    fontSize: 12,
    color: '#a3a3a3',
    marginBottom: 2,
  },
  section: {
    marginBottom: 16,
  },
  sectionCard: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    overflow: 'hidden',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e5e5e5',
  },
  sectionToggle: {
    fontSize: 14,
    color: '#d4a574',
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  contentLabel: {
    fontSize: 12,
    color: '#a3a3a3',
  },
  contentValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleOn: {
    backgroundColor: '#d4a574',
  },
  toggleDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  dangerSection: {
    marginTop: 24,
  },
  dangerCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 8,
    overflow: 'hidden',
  },
  dangerTitle: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ef4444',
  },
  dangerTitleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ef4444',
  },
  dangerContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  dangerButton: {
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
    borderTopWidth: 1,
    borderTopColor: '#ef4444',
  },
  dangerButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerLogo: {
    marginBottom: 12,
  },
  footerText: {
    fontSize: 11,
    color: '#808080',
    marginBottom: 4,
  },
});

export default function SettingsScreen() {
  const { mode } = useApp();
  const theme = getTheme(mode);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [toggles, setToggles] = useState({
    autoConnect: true,
    relayMode: false,
    checkInReminders: true,
    crisisAlerts: true,
    resourceWarnings: true,
  });

  const handleToggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleToggle = (key: keyof typeof toggles) => {
    setToggles((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderToggle = (value: boolean) => (
    <View style={[styles.toggle, value && styles.toggleOn]}>
      <View
        style={[
          styles.toggleDot,
          {
            alignSelf: value ? 'flex-end' : 'flex-start',
          },
        ]}
      />
    </View>
  );

  const renderSection = (
    title: string,
    key: string,
    content: React.ReactNode
  ) => (
    <View style={styles.section}>
      <View style={styles.sectionCard}>
        <Pressable
          style={styles.sectionHeader}
          onPress={() => handleToggleSection(key)}
        >
          <Text style={styles.sectionHeaderText}>{title}</Text>
          <Text style={styles.sectionToggle}>
            {expandedSections[key] ? '−' : '+'}
          </Text>
        </Pressable>
        {expandedSections[key] && (
          <View style={styles.sectionContent}>
            {content}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>U</Text>
          </View>
          <Text style={styles.profileName}>User Name</Text>
          <Text style={styles.profileDetail}>Downtown Block 7</Text>
          <Text style={styles.profileDetail}>Member since Mar 27, 2026</Text>
        </View>

        {/* Encryption & Security */}
        {renderSection(
          'Encryption & Security',
          'encryption',
          <>
            <View style={styles.contentRow}>
              <Text style={styles.contentLabel}>Algorithm</Text>
              <Text style={styles.contentValue}>AES-256-GCM</Text>
            </View>
            <View style={styles.contentRow}>
              <Text style={styles.contentLabel}>Key Derivation</Text>
              <Text style={styles.contentValue}>Argon2id</Text>
            </View>
            <View style={styles.contentRow}>
              <Text style={styles.contentLabel}>Passphrase Strength</Text>
              <Text style={[styles.contentValue, { color: '#22c55e' }]}>
                Strong
              </Text>
            </View>
          </>
        )}

        {/* Mesh Network */}
        {renderSection(
          'Mesh Network',
          'mesh',
          <>
            <View style={styles.contentRow}>
              <Text style={styles.contentLabel}>BLE</Text>
              {renderToggle(toggles.autoConnect)}
            </View>
            <View style={styles.contentRow}>
              <Text style={styles.contentLabel}>Auto-Connect</Text>
              {renderToggle(toggles.autoConnect)}
            </View>
            <View style={styles.contentRow}>
              <Text style={styles.contentLabel}>Relay Mode</Text>
              {renderToggle(toggles.relayMode)}
            </View>
            <View style={styles.contentRow}>
              <Text style={styles.contentLabel}>Channel</Text>
              <Text style={styles.contentValue}>37</Text>
            </View>
            <View style={styles.contentRow}>
              <Text style={styles.contentLabel}>Region</Text>
              <Text style={styles.contentValue}>US</Text>
            </View>
          </>
        )}

        {/* Notifications */}
        {renderSection(
          'Notifications',
          'notifications',
          <>
            <View style={styles.contentRow}>
              <Text style={styles.contentLabel}>Check-in Reminders</Text>
              {renderToggle(toggles.checkInReminders)}
            </View>
            <View style={styles.contentRow}>
              <Text style={styles.contentLabel}>Crisis Alerts</Text>
              {renderToggle(toggles.crisisAlerts)}
            </View>
            <View style={styles.contentRow}>
              <Text style={styles.contentLabel}>Resource Warnings</Text>
              {renderToggle(toggles.resourceWarnings)}
            </View>
          </>
        )}

        {/* Data & Privacy */}
        {renderSection(
          'Data & Privacy',
          'data',
          <>
            <View style={styles.contentRow}>
              <Text style={styles.contentLabel}>Storage Used</Text>
              <Text style={styles.contentValue}>12.4 MB</Text>
            </View>
            <View style={styles.contentRow}>
              <Text style={styles.contentLabel}>Sync Status</Text>
              <Text style={[styles.contentValue, { color: '#22c55e' }]}>
                Synced
              </Text>
            </View>
            <Pressable style={{ paddingVertical: 8 }}>
              <Text style={{ fontSize: 12, color: '#d4a574', fontWeight: '600' }}>
                Export Data
              </Text>
            </Pressable>
            <Pressable style={{ paddingVertical: 8 }}>
              <Text style={{ fontSize: 12, color: '#f59e0b', fontWeight: '600' }}>
                Delete Local Data
              </Text>
            </Pressable>
          </>
        )}

        {/* About EMBER */}
        {renderSection(
          'About EMBER',
          'about',
          <>
            <View style={styles.contentRow}>
              <Text style={styles.contentLabel}>Version</Text>
              <Text style={styles.contentValue}>v1.0.0-mvp</Text>
            </View>
            <View style={styles.contentRow}>
              <Text style={styles.contentLabel}>License</Text>
              <Text style={styles.contentValue}>AGPL v3</Text>
            </View>
            <Pressable style={{ paddingVertical: 8 }}>
              <Text style={{ fontSize: 12, color: '#d4a574', fontWeight: '600' }}>
                View Source Code
              </Text>
            </Pressable>
            <Pressable style={{ paddingVertical: 8 }}>
              <Text style={{ fontSize: 12, color: '#d4a574', fontWeight: '600' }}>
                View Credits
              </Text>
            </Pressable>
          </>
        )}

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <View style={styles.dangerCard}>
            <View style={styles.dangerTitle}>
              <Text style={styles.dangerTitleText}>Danger Zone</Text>
            </View>
            <View style={styles.dangerContent}>
              <Pressable style={styles.dangerButton}>
                <Text style={styles.dangerButtonText}>Leave Community</Text>
              </Pressable>
              <Pressable style={styles.dangerButton}>
                <Text style={styles.dangerButtonText}>Wipe All Data</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLogo}>
            <EmberLogo size={32} glow={false} />
          </View>
          <Text style={styles.footerText}>EMBER v1.0.0-mvp</Text>
          <Text style={styles.footerText}>
            ILLAPEX LLC / Lirio Labs
          </Text>
          <Text style={[styles.footerText, { marginTop: 8 }]}>
            Encrypted Mesh Based Emergency Response
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
