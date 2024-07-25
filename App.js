// App.js
import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n'; // Correct the import path

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        <HomeScreen />
      </SafeAreaView>
    </I18nextProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
