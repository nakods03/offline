import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '@/theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: keyof typeof theme.spacing;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  style,
}) => {
  const cardStyle = [
    styles.card,
    styles[variant],
    { padding: theme.spacing[padding] },
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
  },
  default: {
    ...theme.shadows.sm,
  },
  elevated: {
    ...theme.shadows.lg,
  },
  outlined: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.none,
  },
});