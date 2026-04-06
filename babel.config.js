module.exports = function (api) {
  // api.env must run before api.cache (Babel config API rule).
  const isTest = api.env('test');
  api.cache(true);
  // Unit tests (jest-expo) only need standard Expo transforms; WatermelonDB
  // decorators and the Reanimated Babel plugin break Jest's transformer.
  if (isTest) {
    return {
      presets: ['babel-preset-expo'],
    };
  }
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['@nozbe/watermelondb/decorators'],
      'react-native-reanimated/plugin',
    ],
  };
};