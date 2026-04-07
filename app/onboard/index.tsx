import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#a3a3a3',
    lineHeight: 20,
  },
  inputSection: {
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e5e5e5',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 14,
  },
  buttonSection: {
    gap: 12,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#d4a574',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  cardSection: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    padding: 16,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#d4a574',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 12,
    color: '#a3a3a3',
    lineHeight: 18,
  },
});

export default function OnboardWelcomeScreen() {
  const [name, setName] = useState('');

  const handleCreateCommunity = () => {
    if (name.trim()) {
      router.push({
        pathname: '/onboard/create',
        params: { displayName: name.trim() },
      });
    }
  };

  const handleJoinCommunity = () => {
    if (name.trim()) {
      router.push({
        pathname: '/onboard/join',
        params: { displayName: name.trim() },
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to EMBER</Text>
            <Text style={styles.subtitle}>
              Community resilience powered by encrypted mesh networks
            </Text>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#666666"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.buttonSection}>
            <Pressable
              style={[styles.button, { opacity: !name.trim() ? 0.5 : 1 }]}
              onPress={handleCreateCommunity}
              disabled={!name.trim()}
            >
              <Text style={styles.buttonText}>Create a Community</Text>
            </Pressable>

            <Pressable
              style={[styles.button, { opacity: !name.trim() ? 0.5 : 1 }]}
              onPress={handleJoinCommunity}
              disabled={!name.trim()}
            >
              <Text style={styles.buttonText}>Join a Community</Text>
            </Pressable>
          </View>

          <View style={styles.cardSection}>
            <Text style={styles.cardTitle}>About Encryption</Text>
            <Text style={styles.cardText}>
              EMBER uses end-to-end encryption to protect your community data.
              All messages and resources are encrypted locally on your device
              and can only be decrypted by authorized community members with
              the correct passphrase.
            </Text>
          </View>

          <View style={[styles.cardSection, { marginTop: 16 }]}>
            <Text style={styles.cardTitle}>LoRa mesh radios (Tier 2)</Text>
            <Text style={styles.cardText}>
              1. Use a native dev or release build (Expo Go cannot use BLE).{'\n'}
              2. After onboarding, open the Config tab → Mesh Network.{'\n'}
              3. Turn on system Bluetooth, tap Refresh Bluetooth state if needed, then
              Scan for Meshtastic radios.{'\n'}
              4.{' '}
              {Platform.OS === 'android'
                ? 'Android: the first scan may prompt for Nearby devices / Bluetooth — allow it. If you denied, fix it in App info → EMBER → Permissions, then refresh Bluetooth state in EMBER.'
                : 'iOS: allow Bluetooth access when prompted; you can also use Open system settings on the Mesh Network screen.'}
              {'\n'}
              5. In crisis mode, Config is hidden from the tab bar — use Status (home) to open Config, then Mesh Network.
              {'\n'}
              6. From the main dashboard, the Config link opens Mesh Network directly (deep link).
              {'\n\n'}
              Cellular and LoRa mesh are different links; the app keeps that distinction clear.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
