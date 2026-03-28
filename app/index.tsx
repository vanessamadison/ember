import { router } from 'expo-router';
import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmberLogo } from '../src/components';
import { useApp } from '../src/context/AppContext';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 8,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#a3a3a3',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonSection: {
    width: '100%',
    gap: 12,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#d4a574',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#333333',
  },
  badgeText: {
    fontSize: 11,
    color: '#808080',
    fontWeight: '500',
  },
  footer: {
    marginBottom: 16,
  },
  versionText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
});

export default function SplashScreen() {
  const { setMode } = useApp();

  const handleGetStarted = () => {
    router.push('/onboard');
  };

  const handleSimulateCrisis = () => {
    setMode('crisis');
    router.push('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.content}>
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <EmberLogo size={72} glow={true} />
            </View>
            <Text style={styles.title}>EMBER</Text>
            <Text style={styles.subtitle}>
              Encrypted Mesh Based{'\n'}Emergency Response
            </Text>
          </View>

          <View style={styles.buttonSection}>
            <Pressable
              style={styles.primaryButton}
              onPress={handleGetStarted}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </Pressable>

            <Pressable
              style={styles.secondaryButton}
              onPress={handleSimulateCrisis}
            >
              <Text style={styles.secondaryButtonText}>
                Simulate Crisis Mode
              </Text>
            </Pressable>
          </View>

          <View style={styles.badgesRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>AES-256</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Zero Knowledge</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Offline First</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Open Source</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>AGPL v3</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>v1.0.0-mvp</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
