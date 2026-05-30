// Polyfill Array methods missing in Node 18 (added in Node 20)
if (!Array.prototype.toReversed) {
  Array.prototype.toReversed = function () { return [...this].reverse(); };
}
if (!Array.prototype.toSorted) {
  Array.prototype.toSorted = function (fn) { return [...this].sort(fn); };
}
if (!Array.prototype.toSpliced) {
  Array.prototype.toSpliced = function (...args) { const a = [...this]; a.splice(...args); return a; };
}

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite needs to bundle .wasm files for web (wa-sqlite)
config.resolver.assetExts.push('wasm');

module.exports = config;
