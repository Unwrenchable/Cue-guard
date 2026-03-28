/**
 * PaymentService – thin wrapper around @stripe/stripe-react-native's
 * Apple Pay (iOS) and Google Pay (Android) payment sheet.
 *
 * Usage:
 *   1. Call `PaymentService.presentPaymentSheet(bag)` from the Payment screen.
 *   2. The service selects Apple Pay on iOS and Google Pay on Android.
 *   3. On success it returns a `PaymentResult` with a transactionId.
 *
 * Before calling presentPaymentSheet the consuming screen must wrap the
 * component tree with <StripeProvider> (done in App.tsx).  The publishable
 * key and the PaymentIntent client secret both come from your back-end; for
 * now they are read from environment constants so the service remains
 * testable without a live server.
 */
import { Platform } from 'react-native';
import {
  initPaymentSheet,
  presentPaymentSheet,
  PaymentSheetError,
} from '@stripe/stripe-react-native';
import { StoredBag, PaymentResult } from '../types';

/**
 * Fetch a PaymentIntent client secret from the app's back-end.
 * Replace the URL with your real endpoint before deploying.
 */
async function fetchPaymentIntentClientSecret(bag: StoredBag): Promise<string> {
  const response = await fetch('https://api.cueguard.example.com/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bagId: bag.id, amountCents: bag.amountCents }),
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
  async presentNativePaymentSheet(bag: StoredBag): Promise<PaymentResult> {
    try {
      const clientSecret = await fetchPaymentIntentClientSecret(bag);

      const merchantName = 'Cue Guard Storage';
      const storageFee = (bag.amountCents / 100).toFixed(2);

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: merchantName,
        paymentIntentClientSecret: clientSecret,
        // Enable Apple Pay on iOS
        applePay: Platform.OS === 'ios'
          ? {
              merchantCountryCode: 'US',
              cartItems: [
                {
                  label: `Bag Storage – ${bag.description}`,
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
          phone: bag.ownerPhone,
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

      // A real implementation would retrieve the PaymentIntent ID from the
      // server after confirmation; we use the bag ID as a stand-in here.
      return { success: true, transactionId: `txn_${bag.id}_${Date.now()}` };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Payment failed.';
      return { success: false, error: message };
    }
  }
}

export const paymentService = new PaymentService();
