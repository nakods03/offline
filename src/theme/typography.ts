import { Platform } from 'react-native';

const fontFamily = {
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
  }),
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
  }),
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto-Bold',
  }),
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
  }),
};

export const typography = {
  // Display styles
  display: {
    large: {
      fontFamily: fontFamily.bold,
      fontSize: 32,
      lineHeight: 40,
      letterSpacing: -0.25,
    },
    medium: {
      fontFamily: fontFamily.bold,
      fontSize: 28,
      lineHeight: 36,
      letterSpacing: 0,
    },
    small: {
      fontFamily: fontFamily.bold,
      fontSize: 24,
      lineHeight: 32,
      letterSpacing: 0,
    },
  },
  
  // Heading styles
  heading: {
    h1: {
      fontFamily: fontFamily.bold,
      fontSize: 22,
      lineHeight: 28,
      letterSpacing: 0,
    },
    h2: {
      fontFamily: fontFamily.bold,
      fontSize: 20,
      lineHeight: 26,
      letterSpacing: 0.15,
    },
    h3: {
      fontFamily: fontFamily.medium,
      fontSize: 18,
      lineHeight: 24,
      letterSpacing: 0.15,
    },
    h4: {
      fontFamily: fontFamily.medium,
      fontSize: 16,
      lineHeight: 22,
      letterSpacing: 0.25,
    },
  },
  
  // Body styles
  body: {
    large: {
      fontFamily: fontFamily.regular,
      fontSize: 16,
      lineHeight: 24,
      letterSpacing: 0.5,
    },
    medium: {
      fontFamily: fontFamily.regular,
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.25,
    },
    small: {
      fontFamily: fontFamily.regular,
      fontSize: 12,
      lineHeight: 18,
      letterSpacing: 0.4,
    },
  },
  
  // Label styles
  label: {
    large: {
      fontFamily: fontFamily.medium,
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.1,
    },
    medium: {
      fontFamily: fontFamily.medium,
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.5,
    },
    small: {
      fontFamily: fontFamily.medium,
      fontSize: 11,
      lineHeight: 16,
      letterSpacing: 0.5,
    },
  },
  
  // Special styles
  button: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  
  overline: {
    fontFamily: fontFamily.medium,
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
  
  // Monospace for balance and amounts
  mono: {
    large: {
      fontFamily: fontFamily.mono,
      fontSize: 24,
      lineHeight: 32,
      letterSpacing: 0,
    },
    medium: {
      fontFamily: fontFamily.mono,
      fontSize: 16,
      lineHeight: 24,
      letterSpacing: 0,
    },
    small: {
      fontFamily: fontFamily.mono,
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0,
    },
  },
} as const;