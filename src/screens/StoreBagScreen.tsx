import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import TapPayButton from '../components/TapPayButton';
import { nfcService } from '../services/NFCService';
import { bagStorageService } from '../services/BagStorageService';
import { paymentService } from '../services/PaymentService';
import { RootStackParamList, StoredBag } from '../types';

type StoreBagNavProp = NativeStackNavigationProp<RootStackParamList, 'StoreBag'>;

type Step = 'scan' | 'paying' | 'done';

/**
 * StoreBagScreen – guides the user through:
 *   1. Tap an NFC tag to register the bag.
 *   2. Pay via Apple Pay / Google Pay.
 *   3. Receive a claim code.
 */
const StoreBagScreen: React.FC = () => {
  const navigation = useNavigation<StoreBagNavProp>();
  const [step, setStep] = useState<Step>('scan');
  const [loading, setLoading] = useState(false);
  const [bag, setBag] = useState<StoredBag | null>(null);

  const handleScanAndPay = async () => {
    setLoading(true);
    try {
      // Step 1: Scan NFC tag
      const scanResult = await nfcService.scanTag();
      if (!scanResult.success || !scanResult.tagId) {
        Alert.alert(
          'Scan Failed',
          scanResult.error ?? 'Could not read the NFC tag. Please try again.',
        );
        return;
      }

      const tagId = scanResult.tagId;

      // Register the bag (phone number hard-coded as placeholder)
      const newBag = bagStorageService.storeBag(
        tagId,
        'user-phone-placeholder', // In a real app, fetch from user profile
        `Bag / Gear – ${tagId.slice(-4).toUpperCase()}`,
      );
      setBag(newBag);
      setStep('paying');

      // Step 2: Initiate payment
      const payResult = await paymentService.presentNativePaymentSheet(newBag);
      if (!payResult.success) {
        Alert.alert('Payment Failed', payResult.error ?? 'Please try again.');
        setStep('scan');
        return;
      }

      // Step 3: Mark as paid
      bagStorageService.markAsPaid(tagId);
      const paidBag = bagStorageService.getBagByTagId(tagId);
      if (paidBag) setBag(paidBag);
      setStep('done');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'scan':
        return (
          <>
            <View style={styles.nfcIcon}>
              <Text style={styles.nfcEmoji}>📡</Text>
            </View>
            <Text style={styles.instruction}>
              {Platform.OS === 'ios'
                ? 'Tap your phone to the NFC tag on the bag, then complete Apple Pay.'
                : 'Tap your phone to the NFC tag on the bag, then complete Google Pay.'}
            </Text>
            {loading ? (
              <ActivityIndicator size="large" color="#1a1a2e" style={styles.spinner} />
            ) : (
              <TapPayButton
                onPress={handleScanAndPay}
                label="Tap Tag & Pay"
                style={styles.button}
              />
            )}
          </>
        );

      case 'paying':
        return (
          <>
            <ActivityIndicator size="large" color="#1a1a2e" />
            <Text style={styles.instruction}>Processing payment…</Text>
          </>
        );

      case 'done':
        return (
          <View style={styles.successContainer}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successTitle}>Bag Stored!</Text>
            {bag && (
              <>
                <Text style={styles.successDetail}>Tag: {bag.tagId}</Text>
                <Text style={styles.successDetail}>
                  Claim code: <Text style={styles.claimCode}>{bag.claimCode}</Text>
                </Text>
                <Text style={styles.successNote}>
                  Screenshot or write down your claim code to retrieve your bag.
                </Text>
              </>
            )}
            <TapPayButton
              onPress={() => navigation.navigate('Home')}
              label="Back to Home"
              style={styles.button}
            />
          </View>
        );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Store a Bag</Text>
      {renderStep()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f0f0f5',
    padding: 24,
    alignItems: 'center',
  },
  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 24,
  },
  nfcIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  nfcEmoji: {
    fontSize: 56,
  },
  instruction: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  spinner: {
    marginTop: 16,
  },
  button: {
    width: '100%',
    marginTop: 8,
  },
  successContainer: {
    alignItems: 'center',
    width: '100%',
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#27ae60',
    marginBottom: 12,
  },
  successDetail: {
    fontSize: 15,
    color: '#555',
    marginTop: 4,
  },
  claimCode: {
    fontWeight: '700',
    fontSize: 20,
    color: '#1a1a2e',
  },
  successNote: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
});

export default StoreBagScreen;
