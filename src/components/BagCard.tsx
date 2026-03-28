import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StoredBag } from '../types';

interface BagCardProps {
  bag: StoredBag;
  onPayPress?: (bag: StoredBag) => void;
}

const statusLabel: Record<StoredBag['status'], string> = {
  stored: 'In Storage',
  claimed: 'Claimed',
  pending_payment: 'Pending Payment',
};

const statusColor: Record<StoredBag['status'], string> = {
  stored: '#27ae60',
  claimed: '#7f8c8d',
  pending_payment: '#e67e22',
};

/**
 * BagCard – displays a stored bag's summary and, when payment is pending,
 * shows a "Pay Now" action button.
 */
const BagCard: React.FC<BagCardProps> = ({ bag, onPayPress }) => {
  const storedDate = new Date(bag.storedAt).toLocaleDateString();
  const fee = `$${(bag.amountCents / 100).toFixed(2)}`;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.description}>{bag.description}</Text>
        <View style={[styles.badge, { backgroundColor: statusColor[bag.status] }]}>
          <Text style={styles.badgeText}>{statusLabel[bag.status]}</Text>
        </View>
      </View>

      <Text style={styles.meta}>Tag: {bag.tagId}</Text>
      <Text style={styles.meta}>Stored: {storedDate}</Text>
      <Text style={styles.meta}>Fee: {fee}</Text>
      <Text style={styles.meta}>Claim code: {bag.claimCode}</Text>

      {bag.status === 'pending_payment' && onPayPress && (
        <TouchableOpacity
          style={styles.payButton}
          onPress={() => onPayPress(bag)}
          accessibilityRole="button"
          accessibilityLabel={`Pay ${fee} for ${bag.description}`}
        >
          <Text style={styles.payButtonText}>Pay {fee}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  meta: {
    fontSize: 13,
    color: '#555',
    marginTop: 2,
  },
  payButton: {
    marginTop: 12,
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default BagCard;
