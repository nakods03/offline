module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src',
          '@/components': './src/components',
          '@/screens': './src/screens',
          '@/navigation': './src/navigation',
          '@/state': './src/state',
          '@/db': './src/db',
          '@/crypto': './src/crypto',
          '@/sms': './src/sms',
          '@/qr': './src/qr',
          '@/utils': './src/utils',
          '@/theme': './src/theme',
          '@/types': './src/types',
        },
      },
    ],
  ],
};