module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // WatermelonDB decorator support — plugin is bundled inside the main package
      ['@nozbe/watermelondb/decorators'],
      // Reanimated plugin must always be listed last
      'react-native-reanimated/plugin',
    ],
  };
};