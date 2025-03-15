import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import RandomQRCodeGenerator from './RandomQRCodeGenerator';

const App = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <RandomQRCodeGenerator />
    </SafeAreaView>
  );
};

export default App;