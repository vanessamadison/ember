import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import database from '../src/db';
import { AppProvider } from '../src/context/AppContext';
import { AppHydrationGate } from '../src/context/AppHydrationGate';
import { CryptoBootstrap } from '../src/context/CryptoBootstrap';
import {
  RootCommunityProvider,
} from '../src/context/CommunityContext';
import { MeshRadioProvider } from '../src/context/MeshRadioContext';
import { MeshSyncInboundBridge } from '../src/sync/MeshSyncInboundBridge';
import { initializeDatabase } from '../src/hooks/useDatabase';

initializeDatabase(database);

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <AppHydrationGate>
          <CryptoBootstrap />
          <RootCommunityProvider>
            <MeshRadioProvider>
            <MeshSyncInboundBridge />
            <View style={{ flex: 1, backgroundColor: '#0f0f0f' }}>
              <StatusBar style="light" backgroundColor="#0f0f0f" />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: '#0f0f0f' },
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="onboard" />
                <Stack.Screen name="(tabs)" />
              </Stack>
            </View>
            </MeshRadioProvider>
          </RootCommunityProvider>
        </AppHydrationGate>
      </AppProvider>
    </SafeAreaProvider>
  );
}
