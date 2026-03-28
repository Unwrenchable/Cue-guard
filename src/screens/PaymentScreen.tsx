import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import TapPayButton from '../components/TapPayButton';
import BagCard from '../components/BagCard';
import { paymentService } from '../services/PaymentService';
import { bagStorageService } from '../services/BagStorageService';
import { RootStackParamList } from '../types';

type PaymentRouteProp = RouteProp<RootStackParamList, 'Payment'>;
type PaymentNavProp = NativeStackNavigationProp<RootStackParamList, 'Payment'>;

/**
 * PaymentScreen – shows the bag details and lets the user complete payment
 * via Apple Pay (iOS) or Google Pay (Android) with a single tap.
 */
const PaymentScreen: React.FC = () => {
  const route = useRoute<PaymentRouteProp>();
  const navigation = useNavigation<PaymentNavProp>();
  const { bag } = route.params;

  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(bag.status === 'stored');

  const handlePay = async () => {
    setLoading(true);
    try {
      const result = await paymentService.presentNativePaymentSheet(bag);

      if (result.success) {
        bagStorageService.markAsPaid(bag.tagId);
        setPaid(true);
        Alert.alert(
          '✅ Payment Successful',
          `Your bag is now stored.\nTransaction: ${result.transactionId}\nClaim code: ${bag.claimCode}`,
          [{ text: 'Back to Home', onPress: () => navigation.navigate('Home') }],
        );
      } else {
        Alert.alert('Payment Failed', result.error ?? 'Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Complete Payment</Text>
      <Text style={styles.subheading}>
        Pay securely using your phone's built-in tap-to-pay.
      </Text>

      <View style={styles.cardWrapper}>
        <BagCard bag={bag} />
      </View>

      {paid ? (
        <View style={styles.paidBanner}>
          <Text style={styles.paidText}>✅ Paid – Bag is in storage</Text>
          <Text style={styles.claimInfo}>Claim code: {bag.claimCode}</Text>
        </View>
      ) : (
        <>
          <Text style={styles.feeText}>
            Storage fee: ${(bag.amountCents / 100).toFixed(2)}
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color="#1a1a2e" style={styles.spinner} />
          ) : (
            <TapPayButton onPress={handlePay} loading={loading} style={styles.payButton} />
          )}

          <Text style={styles.disclaimer}>
            Payment is processed securely via Stripe. Your card details are never stored.
          </Text>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f0f0f5',
    padding: 20,
    alignItems: 'center',
  },
  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1a1a2e',
    marginTop: 12,
  },
  subheading: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginVertical: 8,
  },
  cardWrapper: {
    width: '100%',
    marginTop: 16,
  },
  feeText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a2e',
    marginTop: 24,
    marginBottom: 16,
  },
  payButton: {
    marginTop: 8,
    width: '100%',
  },
  spinner: {
    marginTop: 24,
  },
  disclaimer: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  paidBanner: {
    marginTop: 24,
    backgroundColor: '#e8f8f0',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '100%',
  },
  paidText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#27ae60',
  },
  claimInfo: {
    fontSize: 14,
    color: '#555',
    marginTop: 8,
  },
});

export default PaymentScreen;
