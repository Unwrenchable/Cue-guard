import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import CueCard from '../components/BagCard';
import { cueStorageService } from '../services/BagStorageService';
import { RootStackParamList, StoredCue } from '../types';

type HomeNavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

/**
 * HomeScreen – shows all cue cases currently tracked and provides
 * navigation to "Check In", "Pick Up", and "Return" flows.
 *
 * Tournament flow:
 *   Check In Your Cue → pay once → cue is stored securely for the whole tournament.
 *   Pick Up Your Cue  → tap NFC to grab cue before a match.
 *   Return Your Cue   → tap NFC to put cue back in storage after a match.
 */
const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeNavProp>();
  const [cues, setCues] = useState<StoredCue[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadCues = useCallback(() => {
    setCues(cueStorageService.getAllCues());
  }, []);

  useEffect(() => {
    loadCues();
    const unsubscribe = navigation.addListener('focus', loadCues);
    return unsubscribe;
  }, [navigation, loadCues]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadCues();
    setRefreshing(false);
  }, [loadCues]);

  const handlePayPress = useCallback(
    (cue: StoredCue) => {
      navigation.navigate('Payment', { cue });
    },
    [navigation],
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>🎱</Text>
      <Text style={styles.emptyText}>No cues checked in yet.</Text>
      <Text style={styles.emptySubText}>
        Tap "Check In Your Cue" to store your cue case securely for the tournament.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cue Guard</Text>
      <Text style={styles.subtitle}>Secure Cue Storage · Pool Tournaments</Text>

      <FlatList
        data={cues}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CueCard cue={item} onPayPress={handlePayPress} />
        )}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={cues.length === 0 ? styles.listEmpty : styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />

      {/* Three-action footer: Check In / Pick Up / Return */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.checkInButton]}
          onPress={() => navigation.navigate('CheckInCue')}
          accessibilityRole="button"
          accessibilityLabel="Check in your cue"
        >
          <Text style={styles.actionButtonText}>📦{'\n'}Check In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.pickUpButton]}
          onPress={() => navigation.navigate('PickUpCue')}
          accessibilityRole="button"
          accessibilityLabel="Pick up your cue for a match"
        >
          <Text style={styles.actionButtonText}>📲{'\n'}Pick Up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.returnButton]}
          onPress={() => navigation.navigate('ReturnCue')}
          accessibilityRole="button"
          accessibilityLabel="Return your cue to storage"
        >
          <Text style={styles.actionButtonText}>🔄{'\n'}Return</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f5',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a2e',
    textAlign: 'center',
    marginTop: 24,
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  listEmpty: {
    flex: 1,
    paddingHorizontal: 16,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    padding: 10,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  checkInButton: {
    backgroundColor: '#1a1a2e',
  },
  pickUpButton: {
    backgroundColor: '#27ae60',
  },
  returnButton: {
    backgroundColor: '#2980b9',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default HomeScreen;
