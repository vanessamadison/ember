import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createCommunityInDb } from '../../src/db/communityLifecycle';
import { generateInviteCode } from '../../src/crypto/keyDerivation';
import { useApp } from '../../src/context/AppContext';

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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  backButtonText: {
    fontSize: 24,
    color: '#d4a574',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
    marginLeft: 12,
  },
  section: {
    marginBottom: 24,
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
  inviteCodeContainer: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#d4a574',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  inviteCodeLabel: {
    fontSize: 12,
    color: '#a3a3a3',
    marginBottom: 8,
  },
  inviteCode: {
    fontSize: 18,
    fontWeight: '700',
    color: '#d4a574',
    fontFamily: 'Courier New',
    letterSpacing: 3,
  },
  helpText: {
    fontSize: 12,
    color: '#808080',
    marginTop: 8,
    lineHeight: 18,
  },
  button: {
    backgroundColor: '#d4a574',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
});

export default function CreateCommunityScreen() {
  const { displayName: displayNameParam } = useLocalSearchParams<{
    displayName?: string;
  }>();
  const displayName =
    typeof displayNameParam === 'string' ? displayNameParam.trim() : '';

  const {
    setOnboarded,
    setCommunity,
    setUser,
    setUserDisplayName,
  } = useApp();
  const [communityName, setCommunityName] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [busy, setBusy] = useState(false);
  const inviteCode = useMemo(() => generateInviteCode(), []);

  useEffect(() => {
    if (!displayName) {
      router.replace('/onboard');
    }
  }, [displayName]);

  const handleCreate = async () => {
    if (!communityName.trim() || !passphrase.trim() || !displayName || busy) {
      return;
    }
    setBusy(true);
    try {
      const { communityId, memberId } = await createCommunityInDb({
        communityName: communityName.trim(),
        passphrase: passphrase.trim(),
        inviteCode,
        displayName,
      });
      setUserDisplayName(displayName);
      setUser(memberId);
      setCommunity(communityId);
      setOnboarded(true);
      router.replace('/(tabs)');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not create community.';
      Alert.alert('Create failed', message);
    } finally {
      setBusy(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (!displayName) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Pressable style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>←</Text>
            </Pressable>
            <Text style={styles.title}>Create Community</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Community Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Downtown Block 7"
              placeholderTextColor="#666666"
              value={communityName}
              onChangeText={setCommunityName}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Passphrase</Text>
            <TextInput
              style={styles.input}
              placeholder="Create a strong passphrase"
              placeholderTextColor="#666666"
              secureTextEntry={true}
              value={passphrase}
              onChangeText={setPassphrase}
            />
            <Text style={styles.helpText}>
              This passphrase will be used to encrypt and decrypt all community
              data. Share it securely with members you invite.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Invite Code</Text>
            <View style={styles.inviteCodeContainer}>
              <Text style={styles.inviteCodeLabel}>Share this code with others</Text>
              <Text style={styles.inviteCode}>{inviteCode}</Text>
            </View>
            <Text style={styles.helpText}>
              Community members will need this code along with your passphrase
              to join your community.
            </Text>
          </View>

          <Pressable
            style={[
              styles.button,
              {
                opacity:
                  !communityName.trim() || !passphrase.trim() || busy ? 0.5 : 1,
              },
            ]}
            onPress={() => void handleCreate()}
            disabled={!communityName.trim() || !passphrase.trim() || busy}
          >
            {busy ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.buttonText}>Create & Enter</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
