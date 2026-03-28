/**
 * PaymentService – thin wrapper around @stripe/stripe-react-native's
 * Apple Pay (iOS) and Google Pay (Android) payment sheet.
 *
 * Usage:
 *   1. Call `PaymentService.presentPaymentSheet(cue)` from the Payment screen.
 *   2. The service selects Apple Pay on iOS and Google Pay on Android.
 *   3. On success it returns a `PaymentResult` with a transactionId.
 *
 * Before calling presentPaymentSheet the consuming screen must wrap the
 * component tree with <StripeProvider> (done in App.tsx).  The publishable
 * key and the PaymentIntent client secret both come from your back-end; the
 * API base URL is read from the CUE_GUARD_API_URL environment variable so it
 * can be overridden per environment (dev / staging / production).
 */
import { Platform } from 'react-native';
import {
  initPaymentSheet,
  presentPaymentSheet,
  PaymentSheetError,
} from '@stripe/stripe-react-native';
import { StoredCue, PaymentResult } from '../types';

/**
 * Back-end base URL.
 * Set the CUE_GUARD_API_URL environment variable (e.g. in a .env file loaded
 * via expo-constants or babel-plugin-transform-inline-environment-variables).
 * Falls back to the example placeholder so the code compiles without config.
 */
const API_BASE_URL =
  (typeof process !== 'undefined' && process.env.CUE_GUARD_API_URL) ||
  'https://api.cueguard.example.com';

/**
 * Fetch a PaymentIntent client secret from the app's back-end.
 */
async function fetchPaymentIntentClientSecret(cue: StoredCue): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/create-payment-intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cueId: cue.id, amountCents: cue.amountCents }),
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  const { clientSecret } = (await response.json()) as { clientSecret: string };
  return clientSecret;
}

class PaymentService {
  /**
   * Present the native payment sheet (Apple Pay on iOS, Google Pay on Android).
   * Returns a `PaymentResult` indicating success or failure.
   */
  async presentNativePaymentSheet(cue: StoredCue): Promise<PaymentResult> {
    try {
      const clientSecret = await fetchPaymentIntentClientSecret(cue);

      const merchantName = 'Cue Guard Storage';
      const storageFee = (cue.amountCents / 100).toFixed(2);

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: merchantName,
        paymentIntentClientSecret: clientSecret,
        // Enable Apple Pay on iOS
        applePay: Platform.OS === 'ios'
          ? {
              merchantCountryCode: 'US',
              cartItems: [
                {
                  label: `Tournament Storage – ${cue.description}`,
                  amount: storageFee,
                  paymentType: 'final',
                },
              ],
            }
          : undefined,
        // Enable Google Pay on Android
        googlePay: Platform.OS === 'android'
          ? {
              merchantCountryCode: 'US',
              testEnv: __DEV__,
              currencyCode: 'usd',
            }
          : undefined,
        defaultBillingDetails: {
          phone: cue.ownerPhone,
        },
        style: 'automatic',
      });

      if (initError) {
        return { success: false, error: initError.message };
      }

      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code === PaymentSheetError.Canceled) {
          return { success: false, error: 'Payment cancelled.' };
        }
        return { success: false, error: presentError.message };
      }

      return { success: true, transactionId: `txn_${cue.id}_${Date.now()}` };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Payment failed.';
      return { success: false, error: message };
    }
  }
}

export const paymentService = new PaymentService();
