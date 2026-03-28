import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StoredCue } from '../types';

interface CueCardProps {
  cue: StoredCue;
  onPayPress?: (cue: StoredCue) => void;
}

const statusLabel: Record<StoredCue['status'], string> = {
  checked_in: 'In Storage ✓',
  checked_out: 'Checked Out',
  pending_payment: 'Pending Payment',
};

const statusColor: Record<StoredCue['status'], string> = {
  checked_in: '#27ae60',
  checked_out: '#2980b9',
  pending_payment: '#e67e22',
};

/**
 * CueCard – displays a cue case's tournament details.
 *
 * Shows the player's name, tournament, current storage status, and – when
 * payment is still pending – a "Pay Now" button to complete check-in.
 */
const CueCard: React.FC<CueCardProps> = ({ cue, onPayPress }) => {
  const checkInDate = new Date(cue.checkedInAt).toLocaleDateString();
  const lastActivity = new Date(cue.lastActivityAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  const fee = `$${(cue.amountCents / 100).toFixed(2)}`;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.nameBlock}>
          <Text style={styles.ownerName}>{cue.ownerName}</Text>
          <Text style={styles.tournament}>{cue.tournamentName}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: statusColor[cue.status] }]}>
          <Text style={styles.badgeText}>{statusLabel[cue.status]}</Text>
        </View>
      </View>

      <Text style={styles.description}>{cue.description}</Text>

      <View style={styles.metaRow}>
        {cue.tableNumber ? (
          <Text style={styles.meta}>🎱 Table {cue.tableNumber}</Text>
        ) : null}
        <Text style={styles.meta}>📅 Checked in: {checkInDate}</Text>
        <Text style={styles.meta}>🕐 Last activity: {lastActivity}</Text>
        {cue.checkOutCount > 0 && (
          <Text style={styles.meta}>🔄 Pick-ups this tournament: {cue.checkOutCount}</Text>
        )}
        <Text style={styles.meta}>🔑 Claim code: {cue.claimCode}</Text>
      </View>

      {cue.status === 'pending_payment' && onPayPress && (
        <TouchableOpacity
          style={styles.payButton}
          onPress={() => onPayPress(cue)}
          accessibilityRole="button"
          accessibilityLabel={`Pay ${fee} storage fee for ${cue.ownerName}`}
        >
          <Text style={styles.payButtonText}>Pay {fee} Storage Fee</Text>
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
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  nameBlock: {
    flex: 1,
    marginRight: 8,
  },
  ownerName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  tournament: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    color: '#444',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  metaRow: {
    gap: 3,
  },
  meta: {
    fontSize: 13,
    color: '#555',
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

export default CueCard;
