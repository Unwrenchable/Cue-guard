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
import CueCard from '../components/BagCard';
import { paymentService } from '../services/PaymentService';
import { cueStorageService } from '../services/BagStorageService';
import { RootStackParamList } from '../types';

type PaymentRouteProp = RouteProp<RootStackParamList, 'Payment'>;
type PaymentNavProp = NativeStackNavigationProp<RootStackParamList, 'Payment'>;

/**
 * PaymentScreen – shows the cue case details and lets the player pay the
 * one-time tournament storage fee via Apple Pay (iOS) or Google Pay (Android).
 *
 * Once paid the cue is secured for the entire tournament duration.
 * Players can pick up and return their cue as many times as needed at no
 * additional cost.
 */
const PaymentScreen: React.FC = () => {
  const route = useRoute<PaymentRouteProp>();
  const navigation = useNavigation<PaymentNavProp>();
  const { cue } = route.params;

  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(cue.status === 'checked_in');

  const handlePay = async () => {
    setLoading(true);
    try {
      const result = await paymentService.presentNativePaymentSheet(cue);

      if (result.success) {
        cueStorageService.markAsPaid(cue.tagId);
        setPaid(true);
        Alert.alert(
          '✅ Payment Successful',
          `Your cue is now secured for the full tournament.\n\nClaim code: ${cue.claimCode}\n\nPick up or return your cue any time — no extra charge.`,
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
      <Text style={styles.heading}>Tournament Storage Fee</Text>
      <Text style={styles.subheading}>
        Pay once — your cue stays secure for the entire tournament.
        Pick up and return as many times as you need.
      </Text>

      <View style={styles.cardWrapper}>
        <CueCard cue={cue} />
      </View>

      {paid ? (
        <View style={styles.paidBanner}>
          <Text style={styles.paidText}>✅ Paid – Cue is in secure storage</Text>
          <Text style={styles.claimInfo}>Claim code: {cue.claimCode}</Text>
          <Text style={styles.paidNote}>
            Use the Pick Up / Return buttons on the home screen any time.
          </Text>
        </View>
      ) : (
        <>
          <Text style={styles.feeText}>
            Storage fee: ${(cue.amountCents / 100).toFixed(2)}
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color="#1a1a2e" style={styles.spinner} />
          ) : (
            <TapPayButton onPress={handlePay} loading={loading} style={styles.payButton} />
          )}

          <Text style={styles.disclaimer}>
            Payment processed securely via Stripe. Card details are never stored by Cue Guard.
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
    marginVertical: 10,
    lineHeight: 20,
  },
  cardWrapper: {
    width: '100%',
    marginTop: 8,
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
  paidNote: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
});

export default PaymentScreen;
