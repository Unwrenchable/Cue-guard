import { cueStorageService } from '../src/services/BagStorageService';

// Reset the in-memory store between tests via the public API.
beforeEach(() => {
  // Return any checked-out cues so the service is in a clean state.
  cueStorageService.getAllCues().forEach((c) => {
    if (c.status === 'checked_out') cueStorageService.returnCue(c.tagId);
  });
});

describe('CueStorageService', () => {
  const TAG_ID = 'test-tag-001';
  const PHONE = '+15555550100';
  const NAME = 'Mike Sigel';
  const TOURNAMENT = 'Spring Classic 2026';
  const DESCRIPTION = 'Black Predator hard case – 2 cues';

  it('checkInCue registers a new cue with pending_payment status', () => {
    const cue = cueStorageService.checkInCue(TAG_ID, PHONE, NAME, TOURNAMENT, DESCRIPTION);

    expect(cue.tagId).toBe(TAG_ID);
    expect(cue.ownerPhone).toBe(PHONE);
    expect(cue.ownerName).toBe(NAME);
    expect(cue.tournamentName).toBe(TOURNAMENT);
    expect(cue.description).toBe(DESCRIPTION);
    expect(cue.status).toBe('pending_payment');
    expect(cue.amountCents).toBe(500);
    expect(cue.claimCode).toMatch(/^\d{6}$/);
    expect(cue.checkOutCount).toBe(0);
    expect(cue.tableNumber).toBeUndefined();
  });

  it('checkInCue stores the optional table number', () => {
    const cue = cueStorageService.checkInCue(TAG_ID, PHONE, NAME, TOURNAMENT, DESCRIPTION, '7');
    expect(cue.tableNumber).toBe('7');
  });

  it('getCueByTagId returns the registered cue', () => {
    cueStorageService.checkInCue(TAG_ID, PHONE, NAME, TOURNAMENT, DESCRIPTION);
    const found = cueStorageService.getCueByTagId(TAG_ID);
    expect(found).not.toBeNull();
    expect(found!.tagId).toBe(TAG_ID);
  });

  it('getCueByTagId returns null for unknown tag', () => {
    const found = cueStorageService.getCueByTagId('unknown-tag');
    expect(found).toBeNull();
  });

  it('markAsPaid transitions status from pending_payment to checked_in', () => {
    cueStorageService.checkInCue(TAG_ID, PHONE, NAME, TOURNAMENT, DESCRIPTION);
    const updated = cueStorageService.markAsPaid(TAG_ID);
    expect(updated).not.toBeNull();
    expect(updated!.status).toBe('checked_in');
  });

  it('markAsPaid returns null for unknown tag', () => {
    const result = cueStorageService.markAsPaid('no-such-tag');
    expect(result).toBeNull();
  });

  it('checkOutCue transitions status from checked_in to checked_out', () => {
    cueStorageService.checkInCue(TAG_ID, PHONE, NAME, TOURNAMENT, DESCRIPTION);
    cueStorageService.markAsPaid(TAG_ID);
    const checkedOut = cueStorageService.checkOutCue(TAG_ID);
    expect(checkedOut).not.toBeNull();
    expect(checkedOut!.status).toBe('checked_out');
    expect(checkedOut!.checkOutCount).toBe(1);
  });

  it('checkOutCue returns null when cue is pending_payment', () => {
    cueStorageService.checkInCue(TAG_ID, PHONE, NAME, TOURNAMENT, DESCRIPTION);
    const result = cueStorageService.checkOutCue(TAG_ID);
    expect(result).toBeNull();
  });

  it('returnCue transitions status from checked_out back to checked_in', () => {
    cueStorageService.checkInCue(TAG_ID, PHONE, NAME, TOURNAMENT, DESCRIPTION);
    cueStorageService.markAsPaid(TAG_ID);
    cueStorageService.checkOutCue(TAG_ID);
    const returned = cueStorageService.returnCue(TAG_ID);
    expect(returned).not.toBeNull();
    expect(returned!.status).toBe('checked_in');
  });

  it('returnCue returns null when cue is already checked_in', () => {
    cueStorageService.checkInCue(TAG_ID, PHONE, NAME, TOURNAMENT, DESCRIPTION);
    cueStorageService.markAsPaid(TAG_ID);
    const result = cueStorageService.returnCue(TAG_ID); // already checked_in
    expect(result).toBeNull();
  });

  it('checkOutCount increments with each pick-up during the tournament', () => {
    cueStorageService.checkInCue(TAG_ID, PHONE, NAME, TOURNAMENT, DESCRIPTION);
    cueStorageService.markAsPaid(TAG_ID);

    cueStorageService.checkOutCue(TAG_ID);
    cueStorageService.returnCue(TAG_ID);
    cueStorageService.checkOutCue(TAG_ID);
    cueStorageService.returnCue(TAG_ID);
    cueStorageService.checkOutCue(TAG_ID);

    const cue = cueStorageService.getCueByTagId(TAG_ID);
    expect(cue!.checkOutCount).toBe(3);
  });

  it('getCheckedInCues returns only cues with checked_in status', () => {
    const tag2 = 'test-tag-002';
    cueStorageService.checkInCue(TAG_ID, PHONE, NAME, TOURNAMENT, DESCRIPTION);
    cueStorageService.markAsPaid(TAG_ID);
    cueStorageService.checkInCue(tag2, PHONE, 'Earl Strickland', TOURNAMENT, 'Red case'); // pending_payment

    const checkedIn = cueStorageService.getCheckedInCues();
    expect(checkedIn.every((c) => c.status === 'checked_in')).toBe(true);
    expect(checkedIn.find((c) => c.tagId === TAG_ID)).toBeDefined();
    expect(checkedIn.find((c) => c.tagId === tag2)).toBeUndefined();
  });
});
