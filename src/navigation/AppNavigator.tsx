import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import PaymentScreen from '../screens/PaymentScreen';
import ClaimBagScreen from '../screens/ClaimBagScreen';
import StoreBagScreen from '../screens/StoreBagScreen';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => (
  <NavigationContainer>
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: '#1a1a2e' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Cue Guard', headerShown: false }}
      />
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ title: 'Complete Payment' }}
      />
      <Stack.Screen
        name="ClaimBag"
        component={ClaimBagScreen}
        options={{ title: 'Claim a Bag' }}
      />
      <Stack.Screen
        name="StoreBag"
        component={StoreBagScreen}
        options={{ title: 'Store a Bag' }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;
