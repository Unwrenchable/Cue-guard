import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import BagCard from '../components/BagCard';
import { bagStorageService } from '../services/BagStorageService';
import { RootStackParamList, StoredBag } from '../types';

type HomeNavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

/**
 * HomeScreen – shows all bags currently in storage and provides
 * navigation to "Store a Bag" and "Claim a Bag" flows.
 */
const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeNavProp>();
  const [bags, setBags] = useState<StoredBag[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadBags = useCallback(() => {
    const allBags = bagStorageService.getAllBags();
    setBags(allBags);
  }, []);

  useEffect(() => {
    loadBags();
    const unsubscribe = navigation.addListener('focus', loadBags);
    return unsubscribe;
  }, [navigation, loadBags]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadBags();
    setRefreshing(false);
  }, [loadBags]);

  const handlePayPress = useCallback(
    (bag: StoredBag) => {
      navigation.navigate('Payment', { bag });
    },
    [navigation],
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>🎱</Text>
      <Text style={styles.emptyText}>No bags stored yet.</Text>
      <Text style={styles.emptySubText}>Tap "Store a Bag" to get started.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cue Guard</Text>
      <Text style={styles.subtitle}>Tap • Pay • Claim</Text>

      <FlatList
        data={bags}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BagCard bag={item} onPayPress={handlePayPress} />
        )}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={bags.length === 0 ? styles.listEmpty : styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.storeButton]}
          onPress={() => navigation.navigate('StoreBag')}
          accessibilityRole="button"
          accessibilityLabel="Store a bag"
        >
          <Text style={styles.actionButtonText}>📦  Store a Bag</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.claimButton]}
          onPress={() => navigation.navigate('ClaimBag')}
          accessibilityRole="button"
          accessibilityLabel="Claim a bag"
        >
          <Text style={styles.actionButtonText}>📲  Claim a Bag</Text>
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
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 12,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100,
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
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
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
    padding: 12,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  storeButton: {
    backgroundColor: '#1a1a2e',
  },
  claimButton: {
    backgroundColor: '#27ae60',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default HomeScreen;
