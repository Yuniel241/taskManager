import React from 'react';
import { PaperProvider } from 'react-native-paper';
import Navigation from './src/navigation/Navigation';
import { AuthProvider } from './src/context/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <PaperProvider>
        <Navigation />
      </PaperProvider>
    </AuthProvider>
  );
};

export default App;
