const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 */
const config = {
  resolver: {
    alias: {
      'crypto': 'react-native-quick-crypto',
      'stream': 'stream-browserify',
      'buffer': '@craftzdog/react-native-buffer',
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);