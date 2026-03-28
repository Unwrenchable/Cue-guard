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
import BagCard from '../components/BagCard';
import { nfcService } from '../services/NFCService';
import { bagStorageService } from '../services/BagStorageService';
import { RootStackParamList, StoredBag } from '../types';

type ClaimBagNavProp = NativeStackNavigationProp<RootStackParamList, 'ClaimBag'>;

/**
 * ClaimBagScreen – the user taps their phone to the NFC tag on the bag
 * to look it up and claim it.
 */
const ClaimBagScreen: React.FC = () => {
  const navigation = useNavigation<ClaimBagNavProp>();
  const [loading, setLoading] = useState(false);
  const [claimedBag, setClaimedBag] = useState<StoredBag | null>(null);

  const handleClaimTap = async () => {
    setLoading(true);
    try {
      const scanResult = await nfcService.scanTag();

      if (!scanResult.success || !scanResult.tagId) {
        Alert.alert(
          'Scan Failed',
          scanResult.error ?? 'Could not read the NFC tag. Please try again.',
        );
        return;
      }

      const tagId = scanResult.tagId;
      const bag = bagStorageService.getBagByTagId(tagId);

      if (!bag) {
        Alert.alert('Not Found', 'No bag registered to this tag.');
        return;
      }

      if (bag.status === 'claimed') {
        Alert.alert('Already Claimed', 'This bag has already been claimed.');
        return;
      }

      if (bag.status === 'pending_payment') {
        Alert.alert(
          'Payment Required',
          'This bag has not been paid for yet.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Pay Now',
              onPress: () => navigation.navigate('Payment', { bag }),
            },
          ],
        );
        return;
      }

      // Mark as claimed
      const updated = bagStorageService.claimBag(tagId);
      if (updated) {
        setClaimedBag(updated);
      }
    } finally {
      setLoading(false);
    }
  };

  if (claimedBag) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Bag Claimed 🎉</Text>
        <View style={styles.cardWrapper}>
          <BagCard bag={claimedBag} />
        </View>
        <Text style={styles.successNote}>
          Your bag has been released. Enjoy your gear!
        </Text>
        <TapPayButton
          onPress={() => navigation.navigate('Home')}
          label="Back to Home"
          style={styles.button}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Claim a Bag</Text>

      <View style={styles.nfcIcon}>
        <Text style={styles.nfcEmoji}>📲</Text>
      </View>

      <Text style={styles.instruction}>
        {Platform.OS === 'ios'
          ? 'Hold your iPhone near the NFC tag on your bag to claim it.'
          : 'Hold your Android phone near the NFC tag on your bag to claim it.'}
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#27ae60" style={styles.spinner} />
      ) : (
        <TapPayButton
          onPress={handleClaimTap}
          label="Tap to Claim"
          style={[styles.button, styles.claimButton]}
        />
      )}
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
    backgroundColor: '#27ae60',
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
  claimButton: {
    backgroundColor: '#27ae60',
  },
  cardWrapper: {
    width: '100%',
    marginVertical: 12,
  },
  successNote: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginVertical: 16,
  },
});

export default ClaimBagScreen;
