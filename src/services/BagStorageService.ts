/**
 * CueStorageService – in-memory store for cue cases during a tournament.
 *
 * In a production deployment this would be backed by a cloud database so that
 * the venue's desk staff and the player's phone share the same state.
 *
 * Lifecycle:
 *   checkInCue  → status: pending_payment
 *   markAsPaid  → status: checked_in        (cue is secure in the storage room)
 *   checkOutCue → status: checked_out       (player picked up cue for a match)
 *   returnCue   → status: checked_in        (player returned cue after match)
 *   (repeat checkOutCue / returnCue as many times as needed during tournament)
 */
import { StoredCue, CueStatus } from '../types';

// Simulated in-memory database
const cues: Map<string, StoredCue> = new Map();

/**
 * Generate a simple 6-digit numeric claim code.
 * In production this should be a cryptographically random token sent via SMS.
 */
function generateClaimCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

class CueStorageService {
  /**
   * Register a cue case for storage at the start of a tournament.
   * Returns the new record with status `pending_payment`.
   */
  checkInCue(
    tagId: string,
    ownerPhone: string,
    ownerName: string,
    tournamentName: string,
    description: string,
    tableNumber?: string,
  ): StoredCue {
    const now = new Date().toISOString();
    const cue: StoredCue = {
      id: `cue_${tagId}_${Date.now()}`,
      tagId,
      ownerPhone,
      ownerName,
      tournamentName,
      tableNumber,
      description,
      checkedInAt: now,
      lastActivityAt: now,
      claimCode: generateClaimCode(),
      status: 'pending_payment',
      amountCents: 500, // $5.00 one-time tournament storage fee
      checkOutCount: 0,
    };
    cues.set(tagId, cue);
    return cue;
  }

  /**
   * Mark the cue as paid and move it into secure storage.
   * Called after a successful Apple Pay / Google Pay transaction.
   */
  markAsPaid(tagId: string): StoredCue | null {
    const cue = cues.get(tagId);
    if (!cue) return null;
    const updated: StoredCue = {
      ...cue,
      status: 'checked_in',
      lastActivityAt: new Date().toISOString(),
    };
    cues.set(tagId, updated);
    return updated;
  }

  /**
   * Player taps their phone to pick up their cue before a match.
   * Transitions status from `checked_in` → `checked_out`.
   */
  checkOutCue(tagId: string): StoredCue | null {
    const cue = cues.get(tagId);
    if (!cue || cue.status !== 'checked_in') return null;
    const updated: StoredCue = {
      ...cue,
      status: 'checked_out',
      checkOutCount: cue.checkOutCount + 1,
      lastActivityAt: new Date().toISOString(),
    };
    cues.set(tagId, updated);
    return updated;
  }

  /**
   * Player taps their phone to return their cue to storage after a match.
   * Transitions status from `checked_out` → `checked_in`.
   */
  returnCue(tagId: string): StoredCue | null {
    const cue = cues.get(tagId);
    if (!cue || cue.status !== 'checked_out') return null;
    const updated: StoredCue = {
      ...cue,
      status: 'checked_in',
      lastActivityAt: new Date().toISOString(),
    };
    cues.set(tagId, updated);
    return updated;
  }

  /** Look up a cue by its NFC tag ID. */
  getCueByTagId(tagId: string): StoredCue | null {
    return cues.get(tagId) ?? null;
  }

  /** Return all cue cases currently in secure storage (checked_in). */
  getCheckedInCues(): StoredCue[] {
    return Array.from(cues.values()).filter((c) => c.status === 'checked_in');
  }

  /** Return all cue cases regardless of status. */
  getAllCues(): StoredCue[] {
    return Array.from(cues.values());
  }
}

export const cueStorageService = new CueStorageService();
