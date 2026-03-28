import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import PaymentScreen from '../screens/PaymentScreen';
import PickUpCueScreen from '../screens/ClaimBagScreen';
import CheckInCueScreen from '../screens/StoreBagScreen';
import ReturnCueScreen from '../screens/ReturnCueScreen';
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
        options={{ title: 'Storage Fee' }}
      />
      <Stack.Screen
        name="PickUpCue"
        component={PickUpCueScreen}
        options={{ title: 'Pick Up Your Cue' }}
      />
      <Stack.Screen
        name="CheckInCue"
        component={CheckInCueScreen}
        options={{ title: 'Check In Your Cue' }}
      />
      <Stack.Screen
        name="ReturnCue"
        component={ReturnCueScreen}
        options={{ title: 'Return Your Cue' }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;
