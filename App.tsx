import React, { useEffect } from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';
import { StatusBar } from 'expo-status-bar';

import AppNavigator from './src/navigation/AppNavigator';
import { nfcService } from './src/services/NFCService';

/**
 * Replace with your Stripe publishable key.
 * In production load this from an environment variable / secure config.
 */
const STRIPE_PUBLISHABLE_KEY = 'pk_test_replace_with_your_key';

export default function App() {
  useEffect(() => {
    nfcService.init();
    return () => {
      nfcService.cleanup();
    };
  }, []);

  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY} merchantIdentifier="merchant.com.cueguard.app">
      <StatusBar style="auto" />
      <AppNavigator />
    </StripeProvider>
  );
}
