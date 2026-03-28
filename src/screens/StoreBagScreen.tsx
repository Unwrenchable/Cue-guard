import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import TapPayButton from '../components/TapPayButton';
import { nfcService } from '../services/NFCService';
import { cueStorageService } from '../services/BagStorageService';
import { paymentService } from '../services/PaymentService';
import { RootStackParamList, StoredCue } from '../types';

type CheckInNavProp = NativeStackNavigationProp<RootStackParamList, 'CheckInCue'>;

type Step = 'form' | 'scan' | 'paying' | 'done';

/**
 * CheckInCueScreen – guides a tournament player through checking in their cue case:
 *
 *   1. Fill in player name, tournament name, cue case description, and table number.
 *   2. Tap phone to the NFC tag on the case to register it.
 *   3. Pay the one-time tournament storage fee via Apple Pay / Google Pay.
 *   4. Receive a 6-digit claim code – cue is now secured for the full tournament.
 *
 * Players can pick up and return their cue as many times as they like during
 * the tournament without paying again.
 */
const CheckInCueScreen: React.FC = () => {
  const navigation = useNavigation<CheckInNavProp>();

  // Form fields
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [tournamentName, setTournamentName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [description, setDescription] = useState('');

  const [step, setStep] = useState<Step>('form');
  const [loading, setLoading] = useState(false);
  const [cue, setCue] = useState<StoredCue | null>(null);

  const handleProceedToScan = () => {
    if (!ownerName.trim()) {
      Alert.alert('Required', 'Please enter your name.');
      return;
    }
    if (!ownerPhone.trim()) {
      Alert.alert('Required', 'Please enter your phone number.');
      return;
    }
    if (!tournamentName.trim()) {
      Alert.alert('Required', 'Please enter the tournament name.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Required', 'Please describe your cue case (e.g. "Black Predator hard case").');
      return;
    }
    setStep('scan');
  };

  const handleScanAndPay = async () => {
    setLoading(true);
    try {
      // Step 1: Scan the NFC tag on the cue case
      const scanResult = await nfcService.scanTag();
      if (!scanResult.success || !scanResult.tagId) {
        Alert.alert(
          'Scan Failed',
          scanResult.error ?? 'Could not read the NFC tag. Please try again.',
        );
        return;
      }

      const tagId = scanResult.tagId;

      // Step 2: Register the cue in the system
      const newCue = cueStorageService.checkInCue(
        tagId,
        ownerPhone.trim(),
        ownerName.trim(),
        tournamentName.trim(),
        description.trim(),
        tableNumber.trim() || undefined,
      );
      setCue(newCue);
      setStep('paying');

      // Step 3: Collect the one-time storage fee
      const payResult = await paymentService.presentNativePaymentSheet(newCue);
      if (!payResult.success) {
        Alert.alert('Payment Failed', payResult.error ?? 'Please try again.');
        setStep('scan');
        return;
      }

      // Step 4: Mark cue as checked in
      const paidCue = cueStorageService.markAsPaid(tagId);
      if (paidCue) setCue(paidCue);
      setStep('done');
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.sectionLabel}>Your Details</Text>

      <TextInput
        style={styles.input}
        placeholder="Your name (e.g. Mike Sigel)"
        value={ownerName}
        onChangeText={setOwnerName}
        autoCapitalize="words"
        returnKeyType="next"
        accessibilityLabel="Player name"
      />
      <TextInput
        style={styles.input}
        placeholder="Mobile number (e.g. +1 555 555 0100)"
        value={ownerPhone}
        onChangeText={setOwnerPhone}
        keyboardType="phone-pad"
        returnKeyType="next"
        accessibilityLabel="Mobile phone number"
      />

      <Text style={styles.sectionLabel}>Tournament Details</Text>

      <TextInput
        style={styles.input}
        placeholder="Tournament name (e.g. Spring Classic 2026)"
        value={tournamentName}
        onChangeText={setTournamentName}
        autoCapitalize="words"
        returnKeyType="next"
        accessibilityLabel="Tournament name"
      />
      <TextInput
        style={styles.input}
        placeholder="Table number (optional)"
        value={tableNumber}
        onChangeText={setTableNumber}
        keyboardType="number-pad"
        returnKeyType="next"
        accessibilityLabel="Table number"
      />

      <Text style={styles.sectionLabel}>Cue Case</Text>

      <TextInput
        style={[styles.input, styles.inputMultiline]}
        placeholder="Describe your case (e.g. Black Predator hard case – 2 cues)"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={2}
        accessibilityLabel="Cue case description"
      />

      <TapPayButton
        onPress={handleProceedToScan}
        label="Next – Scan NFC Tag →"
        style={styles.button}
      />
    </KeyboardAvoidingView>
  );

  const renderScan = () => (
    <>
      <View style={styles.nfcIcon}>
        <Text style={styles.nfcEmoji}>📡</Text>
      </View>
      <Text style={styles.instruction}>
        {Platform.OS === 'ios'
          ? 'Hold your iPhone near the NFC tag on your cue case, then complete Apple Pay to secure your spot.'
          : 'Hold your Android phone near the NFC tag on your cue case, then complete Google Pay to secure your spot.'}
      </Text>
      <Text style={styles.feeNote}>One-time fee: $5.00 covers the full tournament.</Text>
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

  const renderPaying = () => (
    <>
      <ActivityIndicator size="large" color="#1a1a2e" />
      <Text style={styles.instruction}>Processing payment…</Text>
    </>
  );

  const renderDone = () => (
    <View style={styles.successContainer}>
      <Text style={styles.successIcon}>✅</Text>
      <Text style={styles.successTitle}>Cue Secured!</Text>
      {cue && (
        <>
          <Text style={styles.successDetail}>
            <Text style={styles.bold}>{cue.ownerName}</Text> · {cue.tournamentName}
          </Text>
          {cue.tableNumber ? (
            <Text style={styles.successDetail}>🎱 Table {cue.tableNumber}</Text>
          ) : null}
          <Text style={styles.successDetail}>{cue.description}</Text>
          <View style={styles.claimBox}>
            <Text style={styles.claimLabel}>Your claim code</Text>
            <Text style={styles.claimCode}>{cue.claimCode}</Text>
          </View>
          <Text style={styles.successNote}>
            Screenshot this screen. Tap the NFC tag on your case at any time during the
            tournament to pick up or return your cue — no extra charge.
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

  const stepContent: Record<Step, React.ReactNode> = {
    form: renderForm(),
    scan: renderScan(),
    paying: renderPaying(),
    done: renderDone(),
  };

  const headings: Record<Step, string> = {
    form: 'Check In Your Cue',
    scan: 'Tap Your Cue Case',
    paying: 'Securing Storage…',
    done: 'You\'re All Set!',
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading}>{headings[step]}</Text>
      {stepContent[step]}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f0f0f5',
    padding: 24,
  },
  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1a1a2e',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputMultiline: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  nfcIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    alignSelf: 'center',
  },
  nfcEmoji: {
    fontSize: 56,
  },
  instruction: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  feeNote: {
    fontSize: 14,
    color: '#1a1a2e',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  spinner: {
    marginTop: 16,
    alignSelf: 'center',
  },
  button: {
    width: '100%',
    marginTop: 12,
  },
  successContainer: {
    alignItems: 'center',
    width: '100%',
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#27ae60',
    marginBottom: 12,
  },
  successDetail: {
    fontSize: 15,
    color: '#555',
    marginTop: 4,
    textAlign: 'center',
  },
  bold: {
    fontWeight: '700',
    color: '#1a1a2e',
  },
  claimBox: {
    marginTop: 20,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1a1a2e',
    width: '100%',
  },
  claimLabel: {
    fontSize: 12,
    color: '#888',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  claimCode: {
    fontWeight: '800',
    fontSize: 36,
    color: '#1a1a2e',
    letterSpacing: 8,
  },
  successNote: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    lineHeight: 20,
  },
});

export default CheckInCueScreen;
