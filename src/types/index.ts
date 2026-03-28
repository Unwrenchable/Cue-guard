// Shared types for Cue Guard

/**
 * Lifecycle of a cue case during a tournament:
 *  pending_payment → checked_in (after payment) → checked_out (player picks up for a match)
 *                                                → checked_in  (player returns after match)
 *
 * Players may cycle between checked_in ↔ checked_out as many times as needed
 * throughout the tournament.
 */
export type CueStatus = 'pending_payment' | 'checked_in' | 'checked_out';

export interface StoredCue {
  id: string;
  /** NFC tag ID attached to the cue case. */
  tagId: string;
  /** Player's mobile phone number used for identity verification at pick-up. */
  ownerPhone: string;
  /** Player's name, e.g. "Mike Sigel". */
  ownerName: string;
  /** Name of the tournament, e.g. "Spring Classic 2026". */
  tournamentName: string;
  /** Player's assigned table number, if known. */
  tableNumber?: string;
  /** Short description of the case, e.g. "Black Predator hard case – 2 cues". */
  description: string;
  /** ISO date string when the cue was first checked in. */
  checkedInAt: string;
  /** ISO date string of the last status change. */
  lastActivityAt: string;
  /** 6-digit code the player uses to verify identity when picking up. */
  claimCode: string;
  status: CueStatus;
  /** One-time storage fee for the full tournament duration, in cents. */
  amountCents: number;
  /** How many times the player has checked the cue out during this tournament. */
  checkOutCount: number;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export interface NFCScanResult {
  success: boolean;
  tagId?: string;
  error?: string;
}

export type RootStackParamList = {
  Home: undefined;
  Payment: { cue: StoredCue };
  PickUpCue: undefined;
  CheckInCue: undefined;
  ReturnCue: undefined;
};
