module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-quick-crypto|react-native-get-random-values|react-native-svg|@react-navigation|react-native-safe-area-context|react-native-screens|uuid)/)'
  ],
};
