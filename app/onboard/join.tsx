import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { joinCommunityInDb } from '../../src/db/communityLifecycle';
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
    textAlign: 'center',
  },
  inviteInput: {
    fontFamily: 'Courier New',
    letterSpacing: 2,
    fontSize: 16,
    fontWeight: '600',
  },
  skillsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e5e5e5',
    marginBottom: 12,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: '30%',
    alignItems: 'center',
  },
  skillButtonSelected: {
    borderColor: '#d4a574',
    backgroundColor: 'rgba(212, 165, 116, 0.1)',
  },
  skillButtonText: {
    fontSize: 13,
    color: '#e5e5e5',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#d4a574',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
});

const SKILLS = [
  'First Aid',
  'CPR',
  'Medical',
  'HAM Radio',
  'Electrical',
  'Plumbing',
  'Carpentry',
  'Cooking',
  'Gardening',
  'Teaching',
  'Security',
  'IT/Tech',
  'Solar',
  'Water Purification',
  'Navigation',
  'Spanish',
  'ASL',
];

export default function JoinCommunityScreen() {
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
  const [inviteCode, setInviteCode] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!displayName) {
      router.replace('/onboard');
    }
  }, [displayName]);

  const handleToggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleJoin = async () => {
    if (!inviteCode.trim() || !passphrase.trim() || !displayName || busy) {
      return;
    }
    setBusy(true);
    try {
      const { communityId, memberId } = await joinCommunityInDb({
        inviteCode,
        passphrase: passphrase.trim(),
        displayName,
        skills: selectedSkills,
      });
      setUserDisplayName(displayName);
      setUser(memberId);
      setCommunity(communityId);
      setOnboarded(true);
      router.replace('/(tabs)');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not join community.';
      Alert.alert('Join failed', message);
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
            <Text style={styles.title}>Join Community</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Invite Code</Text>
            <TextInput
              style={[styles.input, styles.inviteInput]}
              placeholder="EMBR-XXXX-XXXX"
              placeholderTextColor="#666666"
              value={inviteCode}
              onChangeText={(text) => setInviteCode(text.toUpperCase())}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Passphrase</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter the community passphrase"
              placeholderTextColor="#666666"
              secureTextEntry={true}
              value={passphrase}
              onChangeText={setPassphrase}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.skillsLabel}>Your Skills (Optional)</Text>
            <View style={styles.skillsGrid}>
              {SKILLS.map((skill) => (
                <Pressable
                  key={skill}
                  style={[
                    styles.skillButton,
                    selectedSkills.includes(skill) &&
                      styles.skillButtonSelected,
                  ]}
                  onPress={() => handleToggleSkill(skill)}
                >
                  <Text style={styles.skillButtonText}>{skill}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Pressable
            style={[
              styles.button,
              {
                opacity:
                  !inviteCode.trim() || !passphrase.trim() || busy ? 0.5 : 1,
              },
            ]}
            onPress={() => void handleJoin()}
            disabled={!inviteCode.trim() || !passphrase.trim() || busy}
          >
            {busy ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.buttonText}>Join Community</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
