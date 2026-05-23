const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite needs to bundle .wasm files for web (wa-sqlite)
config.resolver.assetExts.push('wasm');

module.exports = config;
