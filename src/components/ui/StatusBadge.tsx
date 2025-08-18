import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TransactionStatus } from '@/types';
import { theme } from '@/theme';

interface StatusBadgeProps {
  status: TransactionStatus;
  size?: 'small' | 'medium';
}

const statusConfig = {
  DRAFT: {
    label: 'Draft',
    color: theme.colors.neutral[600],
    backgroundColor: theme.colors.neutral[100],
  },
  SENDING: {
    label: 'Sending',
    color: theme.colors.warning[700],
    backgroundColor: theme.colors.warning[100],
  },
  SENT: {
    label: 'Sent',
    color: theme.colors.primary[700],
    backgroundColor: theme.colors.primary[100],
  },
  DELIVERED: {
    label: 'Delivered',
    color: theme.colors.success[700],
    backgroundColor: theme.colors.success[100],
  },
  APPLIED: {
    label: 'Applied',
    color: theme.colors.success[700],
    backgroundColor: theme.colors.success[100],
  },
  FAILED_TEMP: {
    label: 'Retry',
    color: theme.colors.warning[700],
    backgroundColor: theme.colors.warning[100],
  },
  FAILED_PERM: {
    label: 'Failed',
    color: theme.colors.error[700],
    backgroundColor: theme.colors.error[100],
  },
  INCOMING: {
    label: 'Incoming',
    color: theme.colors.primary[700],
    backgroundColor: theme.colors.primary[100],
  },
  VERIFIED: {
    label: 'Verified',
    color: theme.colors.success[700],
    backgroundColor: theme.colors.success[100],
  },
  UNVERIFIED: {
    label: 'Unverified',
    color: theme.colors.warning[700],
    backgroundColor: theme.colors.warning[100],
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'medium',
}) => {
  const config = statusConfig[status];
  
  const badgeStyle = [
    styles.badge,
    styles[size],
    {
      backgroundColor: config.backgroundColor,
    },
  ];

  const textStyle = [
    styles.text,
    styles[`${size}Text`],
    {
      color: config.color,
    },
  ];

  return (
    <View style={badgeStyle}>
      <Text style={textStyle}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  text: {
    ...theme.typography.label.small,
    fontWeight: '600',
  },

  // Sizes
  small: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    minHeight: 20,
  },
  smallText: {
    fontSize: 10,
  },
  medium: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    minHeight: 24,
  },
  mediumText: {
    fontSize: 12,
  },
});