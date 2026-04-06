// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: 'expo',
  ignorePatterns: [
    '/dist/*',
    'node_modules/',
    '.expo/',
    'coverage/',
    'demo/',
  ],
  rules: {
    'react-hooks/immutability': 'error',
    'react-hooks/purity': 'error',
    'react-hooks/refs': 'error',
  },
};
