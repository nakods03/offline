import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Card } from './Card';
import { theme } from '@/theme';

interface QRCardProps {
  data: string;
  title?: string;
  subtitle?: string;
  size?: number;
}

const { width } = Dimensions.get('window');
const defaultSize = Math.min(width - theme.spacing.xl * 2, 200);

export const QRCard: React.FC<QRCardProps> = ({
  data,
  title,
  subtitle,
  size = defaultSize,
}) => {
  return (
    <Card style={styles.container} variant="elevated">
      <View style={styles.content}>
        {title && <Text style={styles.title}>{title}</Text>}
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        
        <View style={styles.qrContainer}>
          <QRCode
            value={data}
            size={size}
            color={theme.colors.text.primary}
            backgroundColor={theme.colors.background}
            logoBackgroundColor="transparent"
          />
        </View>
        
        <Text style={styles.instruction}>
          Show this QR code to share your wallet info
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    ...theme.typography.heading.h3,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body.medium,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  qrContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  instruction: {
    ...theme.typography.caption,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
  },
});