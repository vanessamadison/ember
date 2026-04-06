/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  // jest-expo defaults + Meshtastic / Buf ESM packages (see jest-expo/jest-preset.js)
  transformIgnorePatterns: [
    '/node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|@meshtastic/protobufs|@bufbuild/protobuf)',
    '/node_modules/react-native-reanimated/plugin/',
  ],
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/demo/',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!**/*.d.ts',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^react-native-ble-plx$': '<rootDir>/__mocks__/react-native-ble-plx.js',
  },
  clearMocks: true,
};
