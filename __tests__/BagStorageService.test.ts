import { bagStorageService } from '../src/services/BagStorageService';

// Reset the in-memory store between tests by clearing its internal Map.
// We access the private `bags` map indirectly through the public API.
beforeEach(() => {
  // Claim and clear all bags so each test starts clean.
  const all = bagStorageService.getAllBags();
  all.forEach((b) => {
    if (b.status === 'stored') {
      bagStorageService.claimBag(b.tagId);
    }
  });
});

describe('BagStorageService', () => {
  const TAG_ID = 'test-tag-001';
  const PHONE = '+15555550100';
  const DESCRIPTION = 'Blue duffel bag';

  it('storeBag registers a new bag with pending_payment status', () => {
    const bag = bagStorageService.storeBag(TAG_ID, PHONE, DESCRIPTION);

    expect(bag.tagId).toBe(TAG_ID);
    expect(bag.ownerPhone).toBe(PHONE);
    expect(bag.description).toBe(DESCRIPTION);
    expect(bag.status).toBe('pending_payment');
    expect(bag.amountCents).toBe(500);
    expect(bag.claimCode).toMatch(/^\d{6}$/);
  });

  it('getBagByTagId returns the stored bag', () => {
    bagStorageService.storeBag(TAG_ID, PHONE, DESCRIPTION);
    const found = bagStorageService.getBagByTagId(TAG_ID);
    expect(found).not.toBeNull();
    expect(found!.tagId).toBe(TAG_ID);
  });

  it('getBagByTagId returns null for unknown tag', () => {
    const found = bagStorageService.getBagByTagId('unknown-tag');
    expect(found).toBeNull();
  });

  it('markAsPaid transitions status from pending_payment to stored', () => {
    bagStorageService.storeBag(TAG_ID, PHONE, DESCRIPTION);
    const updated = bagStorageService.markAsPaid(TAG_ID);
    expect(updated).not.toBeNull();
    expect(updated!.status).toBe('stored');
  });

  it('markAsPaid returns null for unknown tag', () => {
    const result = bagStorageService.markAsPaid('no-such-tag');
    expect(result).toBeNull();
  });

  it('claimBag transitions status from stored to claimed', () => {
    bagStorageService.storeBag(TAG_ID, PHONE, DESCRIPTION);
    bagStorageService.markAsPaid(TAG_ID);
    const claimed = bagStorageService.claimBag(TAG_ID);
    expect(claimed).not.toBeNull();
    expect(claimed!.status).toBe('claimed');
  });

  it('claimBag returns null when bag is in pending_payment state', () => {
    bagStorageService.storeBag(TAG_ID, PHONE, DESCRIPTION);
    // Status is pending_payment, not stored – should not be claimable.
    const claimed = bagStorageService.claimBag(TAG_ID);
    expect(claimed).toBeNull();
  });

  it('getStoredBags returns only bags with stored status', () => {
    const tag2 = 'test-tag-002';
    bagStorageService.storeBag(TAG_ID, PHONE, DESCRIPTION);
    bagStorageService.markAsPaid(TAG_ID);
    bagStorageService.storeBag(tag2, PHONE, 'Red backpack'); // pending_payment

    const stored = bagStorageService.getStoredBags();
    expect(stored.every((b) => b.status === 'stored')).toBe(true);
    expect(stored.find((b) => b.tagId === TAG_ID)).toBeDefined();
    expect(stored.find((b) => b.tagId === tag2)).toBeUndefined();
  });
});
