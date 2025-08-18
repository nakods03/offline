import React, { useEffect, useState } from 'react';
import { StatusBar, Alert } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-get-random-values'; // Must be imported before any crypto operations

import { AppNavigator } from '@/navigation';
import { initializeRealm, initializeDefaultData } from '@/db/realm';
import { initializeAllStores } from '@/state';
import { theme } from '@/theme';

const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('Initializing Offline SMS Wallet...');
      
      // Initialize Realm database
      console.log('Initializing database...');
      await initializeRealm();
      await initializeDefaultData();
      
      // Initialize all Zustand stores
      console.log('Initializing state stores...');
      await initializeAllStores();
      
      console.log('App initialization complete');
      setIsInitialized(true);
    } catch (error) {
      console.error('App initialization failed:', error);
      setInitError(error instanceof Error ? error.message : 'Unknown initialization error');
      
      Alert.alert(
        'Initialization Failed',
        'The app failed to initialize properly. Please restart the app.',
        [
          {
            text: 'Retry',
            onPress: () => {
              setInitError(null);
              initializeApp();
            },
          },
        ]
      );
    }
  };

  if (initError) {
    return null; // Error alert is shown, wait for user action
  }

  if (!isInitialized) {
    // TODO: Add a proper loading screen with app logo
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={theme.colors.background}
        />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;