/**
 * NFCService – wraps react-native-nfc-manager to provide a simple
 * scan-and-read interface for both Android and iOS.
 *
 * On Android the app uses the standard NFC foreground dispatch (Ndef /
 * NfcA technology).  On iOS (Core NFC) an ISO 14443-3A / NDEF session is
 * used; the user sees the standard system NFC sheet automatically.
 */
import NfcManager, { NfcTech, TagEvent } from 'react-native-nfc-manager';
import { NFCScanResult } from '../types';

class NFCService {
  private initialized = false;

  /** Call once at app startup (e.g. in App.tsx useEffect). */
  async init(): Promise<void> {
    const supported = await NfcManager.isSupported();
    if (supported) {
      await NfcManager.start();
      this.initialized = true;
    }
  }

  /** Returns true when the device hardware supports NFC. */
  async isSupported(): Promise<boolean> {
    return NfcManager.isSupported();
  }

  /**
   * Present the NFC scan sheet and wait for the user to tap a tag.
   * Resolves with the tag's ID (hex string) on success.
   *
   * Works on both Android (Ndef / NfcA) and iOS (Iso15693 / Ndef).
   */
  async scanTag(): Promise<NFCScanResult> {
    if (!this.initialized) {
      return { success: false, error: 'NFC not initialized or not supported on this device.' };
    }

    try {
      // Request the NFC technology – on iOS this shows the system sheet.
      await NfcManager.requestTechnology([NfcTech.Ndef, NfcTech.NfcA]);

      const tag: TagEvent | null = await NfcManager.getTag();
      if (!tag) {
        return { success: false, error: 'No tag data returned.' };
      }

      const tagId = tag.id ?? '';
      return { success: true, tagId };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'NFC scan failed.';
      return { success: false, error: message };
    } finally {
      // Always cancel the NFC session so the system sheet is dismissed.
      NfcManager.cancelTechnologyRequest();
    }
  }

  /** Gracefully shut down the NFC manager (call on app unmount). */
  async cleanup(): Promise<void> {
    if (this.initialized) {
      await NfcManager.unregisterTagEvent();
      this.initialized = false;
    }
  }
}

export const nfcService = new NFCService();
