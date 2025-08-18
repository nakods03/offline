import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { theme } from '@/theme';

// Import onboarding screens
import { WelcomeScreen } from '@/screens/onboarding/WelcomeScreen';
import { PhoneInputScreen } from '@/screens/onboarding/PhoneInputScreen';
import { CreatePinScreen } from '@/screens/onboarding/CreatePinScreen';
import { GenerateKeysScreen } from '@/screens/onboarding/GenerateKeysScreen';
import { ShowQRScreen } from '@/screens/onboarding/ShowQRScreen';

type OnboardingStackParamList = {
  Welcome: undefined;
  PhoneInput: undefined;
  CreatePin: undefined;
  GenerateKeys: undefined;
  ShowQR: undefined;
};

const OnboardingStack = createStackNavigator<OnboardingStackParamList>();

export const OnboardingNavigator: React.FC = () => {
  return (
    <OnboardingStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {
          backgroundColor: theme.colors.background,
        },
        gestureEnabled: false, // Disable swipe back during onboarding
      }}
    >
      <OnboardingStack.Screen name="Welcome" component={WelcomeScreen} />
      <OnboardingStack.Screen name="PhoneInput" component={PhoneInputScreen} />
      <OnboardingStack.Screen name="CreatePin" component={CreatePinScreen} />
      <OnboardingStack.Screen name="GenerateKeys" component={GenerateKeysScreen} />
      <OnboardingStack.Screen name="ShowQR" component={ShowQRScreen} />
    </OnboardingStack.Navigator>
  );
};