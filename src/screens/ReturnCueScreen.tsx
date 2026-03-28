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
import CueCard from '../components/BagCard';
import { nfcService } from '../services/NFCService';
import { cueStorageService } from '../services/BagStorageService';
import { RootStackParamList, StoredCue } from '../types';

type ReturnNavProp = NativeStackNavigationProp<RootStackParamList, 'ReturnCue'>;

/**
 * ReturnCueScreen – player taps their phone to the NFC tag on their cue case
 * to return it to secure storage after a match.
 *
 * This is the counterpart to PickUpCueScreen and completes the
 * checked_out → checked_in transition.  No charge is applied.
 *
 * Players can repeat the pick-up / return cycle as many times as needed
 * throughout the tournament without paying again.
 */
const ReturnCueScreen: React.FC = () => {
  const navigation = useNavigation<ReturnNavProp>();
  const [loading, setLoading] = useState(false);
  const [returnedCue, setReturnedCue] = useState<StoredCue | null>(null);

  const handleReturnTap = async () => {
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
      const cue = cueStorageService.getCueByTagId(tagId);

      if (!cue) {
        Alert.alert(
          'Not Found',
          'This tag is not registered. Please check in at the storage desk.',
        );
        return;
      }

      if (cue.status === 'pending_payment') {
        Alert.alert(
          'Payment Required',
          'Storage fee has not been paid yet. Please complete check-in first.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Pay Now',
              onPress: () => navigation.navigate('Payment', { cue }),
            },
          ],
        );
        return;
      }

      if (cue.status === 'checked_in') {
        Alert.alert(
          'Already in Storage',
          `${cue.ownerName}'s cue is already secured in storage. No action needed.`,
        );
        return;
      }

      // Return the cue to storage
      const updated = cueStorageService.returnCue(tagId);
      if (updated) {
        setReturnedCue(updated);
      }
    } finally {
      setLoading(false);
    }
  };

  if (returnedCue) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Cue Returned 🔐</Text>
        <View style={styles.cardWrapper}>
          <CueCard cue={returnedCue} />
        </View>
        <Text style={styles.successNote}>
          Your cue is back in secure storage. Pick it up again before your next match!
        </Text>
        <TapPayButton
          onPress={() => navigation.navigate('Home')}
          label="Back to Home"
          style={styles.button}
        />
        <TapPayButton
          onPress={() => navigation.navigate('PickUpCue')}
          label="Pick Up Again →"
          style={[styles.button, styles.pickUpButton]}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Return Your Cue</Text>

      <View style={styles.nfcIcon}>
        <Text style={styles.nfcEmoji}>🔄</Text>
      </View>

      <Text style={styles.instruction}>
        {Platform.OS === 'ios'
          ? 'Hold your iPhone near the NFC tag on your cue case to return it to secure storage.'
          : 'Hold your Android phone near the NFC tag on your cue case to return it to secure storage.'}
      </Text>

      <Text style={styles.noCharge}>Your cue will be safe until your next match.</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#2980b9" style={styles.spinner} />
      ) : (
        <TapPayButton
          onPress={handleReturnTap}
          label="Tap to Return Cue"
          style={[styles.button, styles.returnButton]}
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
    backgroundColor: '#2980b9',
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
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  noCharge: {
    fontSize: 13,
    color: '#2980b9',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  spinner: {
    marginTop: 16,
  },
  button: {
    width: '100%',
    marginTop: 12,
  },
  returnButton: {
    backgroundColor: '#2980b9',
  },
  pickUpButton: {
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
    lineHeight: 22,
  },
});

export default ReturnCueScreen;
