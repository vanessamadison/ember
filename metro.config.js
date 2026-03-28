const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// WatermelonDB requires this for decorators
config.resolver.sourceExts.push('cjs');

module.exports = config;