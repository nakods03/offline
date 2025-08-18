import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '@/state';
import { RootStackParamList, TabParamList } from '@/types';
import { theme } from '@/theme';

// Import screens
import { OnboardingNavigator } from './OnboardingNavigator';
import { HomeScreen } from '@/screens/HomeScreen';
import { SendScreen } from '@/screens/SendScreen';
import { ReceiveScreen } from '@/screens/ReceiveScreen';
import { HistoryScreen } from '@/screens/HistoryScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { PinLockScreen } from '@/screens/PinLockScreen';
import { TransactionDetailScreen } from '@/screens/TransactionDetailScreen';
import { QRScannerScreen } from '@/screens/QRScannerScreen';
import { BackupScreen } from '@/screens/BackupScreen';
import { RestoreScreen } from '@/screens/RestoreScreen';

const RootStack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Tab Navigator
const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarActiveTintColor: theme.colors.primary[600],
        tabBarInactiveTintColor: theme.colors.text.tertiary,
        tabBarLabelStyle: {
          ...theme.typography.caption,
          fontSize: 10,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="🏠" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Send"
        component={SendScreen}
        options={{
          tabBarLabel: 'Send',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="↗️" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Receive"
        component={ReceiveScreen}
        options={{
          tabBarLabel: 'Receive',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="↙️" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="📋" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="⚙️" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Simple tab icon component
const TabIcon: React.FC<{ name: string; color: string; size: number }> = ({
  name,
  color,
  size,
}) => (
  <span style={{ fontSize: size, color }}>{name}</span>
);

// Main App Navigator
export const AppNavigator: React.FC = () => {
  const { hasPin } = useAuthStore();
  
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!hasPin ? (
          // Onboarding flow for new users
          <RootStack.Screen name="Onboarding" component={OnboardingNavigator} />
        ) : (
          // Main app flow for existing users
          <>
            <RootStack.Screen name="Main" component={TabNavigator} />
            <RootStack.Screen
              name="PinLock"
              component={PinLockScreen}
              options={{
                presentation: 'modal',
                gestureEnabled: false,
              }}
            />
            <RootStack.Screen
              name="TransactionDetail"
              component={TransactionDetailScreen}
              options={{
                presentation: 'modal',
                headerShown: true,
                headerTitle: 'Transaction Details',
              }}
            />
            <RootStack.Screen
              name="QRScanner"
              component={QRScannerScreen}
              options={{
                presentation: 'modal',
                gestureEnabled: false,
              }}
            />
            <RootStack.Screen
              name="Backup"
              component={BackupScreen}
              options={{
                presentation: 'modal',
                headerShown: true,
                headerTitle: 'Backup Wallet',
              }}
            />
            <RootStack.Screen
              name="Restore"
              component={RestoreScreen}
              options={{
                presentation: 'modal',
                headerShown: true,
                headerTitle: 'Restore Wallet',
              }}
            />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};