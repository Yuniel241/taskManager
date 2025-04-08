import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthStack from './AuthStack';
import HomeScreen from '../screens/HomeScreen';
import { useAuth } from '../context/AuthContext';
import AddTaskScreen from '../screens/AddTaskScreen';
import EditTaskScreen from '../screens/EditTaskScreen';
import { RootStackParamList } from '../utils/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

const Navigation = () => {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      {user ? (
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AddTask"
            component={AddTaskScreen}
            options={{ title: 'Ajouter un projet' }}
          />
          <Stack.Screen name="EditTask" component={EditTaskScreen} options={{ title: 'Editer un projet' }} />
          {/* D'autres écrans protégés peuvent être ajoutés ici */}
        </Stack.Navigator>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

export default Navigation;