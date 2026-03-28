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

type PickUpNavProp = NativeStackNavigationProp<RootStackParamList, 'PickUpCue'>;

/**
 * PickUpCueScreen – player taps their phone to the NFC tag on their cue case
 * to check it out of secure storage before a match.
 *
 * The cue must already be checked in and paid for.  If payment is outstanding
 * the user is redirected to the Payment screen first.
 *
 * No additional fee is charged for pick-ups during the tournament.
 */
const PickUpCueScreen: React.FC = () => {
  const navigation = useNavigation<PickUpNavProp>();
  const [loading, setLoading] = useState(false);
  const [checkedOutCue, setCheckedOutCue] = useState<StoredCue | null>(null);

  const handlePickUpTap = async () => {
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
          'Your cue case hasn\'t been paid for yet. Complete payment to check in.',
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

      if (cue.status === 'checked_out') {
        Alert.alert(
          'Already Checked Out',
          `${cue.ownerName}'s cue is already with them. Tap the tag to return it when you're done.`,
        );
        return;
      }

      // Check the cue out of storage
      const updated = cueStorageService.checkOutCue(tagId);
      if (updated) {
        setCheckedOutCue(updated);
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkedOutCue) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Here's Your Cue! 🎱</Text>
        <View style={styles.cardWrapper}>
          <CueCard cue={checkedOutCue} />
        </View>
        <Text style={styles.successNote}>
          Good luck at the tables! Return your cue to storage any time after your match.
        </Text>
        <TapPayButton
          onPress={() => navigation.navigate('Home')}
          label="Back to Home"
          style={styles.button}
        />
        <TapPayButton
          onPress={() => navigation.navigate('ReturnCue')}
          label="Return Cue After Match →"
          style={[styles.button, styles.returnButton]}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Pick Up Your Cue</Text>

      <View style={styles.nfcIcon}>
        <Text style={styles.nfcEmoji}>📲</Text>
      </View>

      <Text style={styles.instruction}>
        {Platform.OS === 'ios'
          ? 'Hold your iPhone near the NFC tag on your cue case to check it out of storage.'
          : 'Hold your Android phone near the NFC tag on your cue case to check it out of storage.'}
      </Text>

      <Text style={styles.noCharge}>No additional charge — your tournament fee covers it.</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#27ae60" style={styles.spinner} />
      ) : (
        <TapPayButton
          onPress={handlePickUpTap}
          label="Tap to Pick Up Cue"
          style={[styles.button, styles.pickUpButton]}
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
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  noCharge: {
    fontSize: 13,
    color: '#27ae60',
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
  pickUpButton: {
    backgroundColor: '#27ae60',
  },
  returnButton: {
    backgroundColor: '#2980b9',
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

export default PickUpCueScreen;
