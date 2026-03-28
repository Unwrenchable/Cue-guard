/**
 * BagStorageService – in-memory store (replace with a real API/database).
 * Handles registering a new bag, marking it as paid, and claiming it.
 */
import { StoredBag, BagStatus } from '../types';

// Simulated in-memory database
const bags: Map<string, StoredBag> = new Map();

/**
 * Generate a simple numeric claim code.
 * In production this should be a cryptographically random token.
 */
function generateClaimCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

class BagStorageService {
  /** Register a new bag for storage and return its record. */
  storeBag(tagId: string, ownerPhone: string, description: string): StoredBag {
    const bag: StoredBag = {
      id: `bag_${tagId}_${Date.now()}`,
      tagId,
      ownerPhone,
      description,
      storedAt: new Date().toISOString(),
      claimCode: generateClaimCode(),
      status: 'pending_payment',
      amountCents: 500, // $5.00 flat storage fee
    };
    bags.set(tagId, bag);
    return bag;
  }

  /** Mark the bag as paid (called after successful payment). */
  markAsPaid(tagId: string): StoredBag | null {
    const bag = bags.get(tagId);
    if (!bag) return null;
    const updated: StoredBag = { ...bag, status: 'stored' };
    bags.set(tagId, updated);
    return updated;
  }

  /** Claim a bag by NFC tag ID. Returns the bag or null if not found. */
  claimBag(tagId: string): StoredBag | null {
    const bag = bags.get(tagId);
    if (!bag || bag.status !== 'stored') return null;
    const updated: StoredBag = { ...bag, status: 'claimed' };
    bags.set(tagId, updated);
    return updated;
  }

  /** Look up a bag by its NFC tag ID. */
  getBagByTagId(tagId: string): StoredBag | null {
    return bags.get(tagId) ?? null;
  }

  /** Return all bags that are currently in storage. */
  getStoredBags(): StoredBag[] {
    return Array.from(bags.values()).filter((b) => b.status === 'stored');
  }

  /** Return all bags regardless of status. */
  getAllBags(): StoredBag[] {
    return Array.from(bags.values());
  }
}

export const bagStorageService = new BagStorageService();
