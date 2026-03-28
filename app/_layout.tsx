import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '../src/context/AppContext';
import { CommunityProvider } from '../src/context/CommunityContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <CommunityProvider>
          <View style={{ flex: 1, backgroundColor: '#0f0f0f' }}>
            <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />
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
        </CommunityProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
