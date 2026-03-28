// Shared types for Cue Guard

export type BagStatus = 'stored' | 'claimed' | 'pending_payment';

export interface StoredBag {
  id: string;
  tagId: string;
  ownerPhone: string;
  description: string;
  storedAt: string; // ISO date string
  claimCode: string;
  status: BagStatus;
  amountCents: number; // storage fee in cents
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
  Payment: { bag: StoredBag };
  ClaimBag: undefined;
  StoreBag: undefined;
};
