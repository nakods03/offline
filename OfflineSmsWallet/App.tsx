/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';
import {SafeAreaView, StatusBar, View, Text, Button, useColorScheme} from 'react-native';
import RootNavigator from './src/navigation';
import {requestSmsPermissions} from './src/utils/permissions';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    requestSmsPermissions().catch(() => {});
  }, []);

  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <RootNavigator />
    </SafeAreaView>
  );
}

export default App;
