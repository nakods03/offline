import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, Input, Card } from '@/components/ui';
import { formatToE164 } from '@/sms/protocol';
import { theme } from '@/theme';

export const PhoneInputScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    setLoading(true);
    
    try {
      // Format and validate phone number
      const formattedPhone = formatToE164(phone.trim());
      
      if (!formattedPhone) {
        Alert.alert(
          'Invalid Phone Number',
          'Please enter a valid phone number with country code (e.g., +1234567890)'
        );
        return;
      }

      // Store phone number temporarily (will be saved to database after PIN creation)
      // Navigate to PIN creation
      navigation.navigate('CreatePin', { phone: formattedPhone });
    } catch (error) {
      console.error('Phone validation error:', error);
      Alert.alert('Error', 'Please enter a valid phone number');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Enter Your Phone Number</Text>
          <Text style={styles.subtitle}>
            This will be your wallet identity. Others will send money to this number.
          </Text>
        </View>

        <Card style={styles.formCard}>
          <Input
            label="Phone Number"
            placeholder="+1 (555) 123-4567"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
            hint="Include country code (e.g., +1 for US)"
            maxLength={20}
          />

          <View style={styles.info}>
            <Text style={styles.infoTitle}>📱 Important:</Text>
            <Text style={styles.infoText}>
              • Use a phone number you control and can receive SMS on{'\n'}
              • This number will be visible to people who send you money{'\n'}
              • You cannot change this number later
            </Text>
          </View>
        </Card>

        <View style={styles.footer}>
          <Button
            title="Continue"
            onPress={handleContinue}
            loading={loading}
            disabled={!phone.trim()}
            fullWidth
            size="large"
          />
          
          <Button
            title="Back"
            onPress={handleBack}
            variant="ghost"
            fullWidth
            style={styles.backButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.heading.h1,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    ...theme.typography.body.medium,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  formCard: {
    marginBottom: theme.spacing.lg,
  },
  info: {
    backgroundColor: theme.colors.primary[50],
    borderColor: theme.colors.primary[200],
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  infoTitle: {
    ...theme.typography.label.medium,
    color: theme.colors.primary[800],
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    ...theme.typography.body.small,
    color: theme.colors.primary[700],
    lineHeight: 18,
  },
  footer: {
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    marginTop: theme.spacing.md,
  },
});