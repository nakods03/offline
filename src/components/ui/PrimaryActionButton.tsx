import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { theme } from '@/theme';

interface PrimaryActionButtonProps {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
  variant?: 'send' | 'receive' | 'default';
  disabled?: boolean;
}

export const PrimaryActionButton: React.FC<PrimaryActionButtonProps> = ({
  title,
  icon,
  onPress,
  variant = 'default',
  disabled = false,
}) => {
  const buttonStyle = [
    styles.button,
    styles[variant],
    disabled && styles.disabled,
  ];

  const textStyle = [
    styles.text,
    styles[`${variant}Text`],
    disabled && styles.disabledText,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.xl,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    minHeight: 80,
    minWidth: 120,
    ...theme.shadows.md,
  },
  iconContainer: {
    marginBottom: theme.spacing.sm,
  },
  text: {
    ...theme.typography.label.medium,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
    ...theme.shadows.none,
  },
  disabledText: {
    opacity: 0.5,
  },

  // Variants
  default: {
    backgroundColor: theme.colors.primary[600],
  },
  defaultText: {
    color: theme.colors.text.inverse,
  },
  send: {
    backgroundColor: theme.colors.primary[600],
  },
  sendText: {
    color: theme.colors.text.inverse,
  },
  receive: {
    backgroundColor: theme.colors.success[600],
  },
  receiveText: {
    color: theme.colors.text.inverse,
  },
});