/**
 * Tests for NFCService.
 * react-native-nfc-manager is mocked so these run in Node (jest-expo).
 */
import { NFCScanResult } from '../src/types';

// Manual mock for react-native-nfc-manager
jest.mock('react-native-nfc-manager', () => {
  const NfcTech = { Ndef: 'Ndef', NfcA: 'NfcA' };
  const mock = {
    isSupported: jest.fn().mockResolvedValue(true),
    start: jest.fn().mockResolvedValue(undefined),
    requestTechnology: jest.fn().mockResolvedValue(undefined),
    getTag: jest.fn().mockResolvedValue({ id: 'aabbccdd' }),
    cancelTechnologyRequest: jest.fn(),
    unregisterTagEvent: jest.fn().mockResolvedValue(undefined),
  };
  return { __esModule: true, default: mock, NfcTech };
});

import NfcManager from 'react-native-nfc-manager';
import { nfcService } from '../src/services/NFCService';

// Re-initialize before each test.
beforeEach(async () => {
  jest.clearAllMocks();
  // Reset internal state via init.
  (NfcManager.isSupported as jest.Mock).mockResolvedValue(true);
  (NfcManager.start as jest.Mock).mockResolvedValue(undefined);
  await nfcService.init();
});

describe('NFCService', () => {
  it('init marks service as initialized when NFC is supported', async () => {
    expect(NfcManager.isSupported).toHaveBeenCalled();
    expect(NfcManager.start).toHaveBeenCalled();
  });

  it('scanTag returns the tag ID on success', async () => {
    (NfcManager.getTag as jest.Mock).mockResolvedValue({ id: 'deadbeef' });

    const result: NFCScanResult = await nfcService.scanTag();

    expect(result.success).toBe(true);
    expect(result.tagId).toBe('deadbeef');
    expect(NfcManager.cancelTechnologyRequest).toHaveBeenCalled();
  });

  it('scanTag returns error when getTag returns null', async () => {
    (NfcManager.getTag as jest.Mock).mockResolvedValue(null);

    const result = await nfcService.scanTag();

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(NfcManager.cancelTechnologyRequest).toHaveBeenCalled();
  });

  it('scanTag returns error when requestTechnology throws', async () => {
    (NfcManager.requestTechnology as jest.Mock).mockRejectedValue(
      new Error('User cancelled scan'),
    );

    const result = await nfcService.scanTag();

    expect(result.success).toBe(false);
    expect(result.error).toBe('User cancelled scan');
    expect(NfcManager.cancelTechnologyRequest).toHaveBeenCalled();
  });

  it('isSupported delegates to NfcManager', async () => {
    (NfcManager.isSupported as jest.Mock).mockResolvedValue(false);
    const supported = await nfcService.isSupported();
    expect(supported).toBe(false);
  });
});
