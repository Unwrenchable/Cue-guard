# Cue Guard

**Secure cue-case storage for pool tournament players.**

Pool tournament players don't want to carry their cue cases around a casino all day. Cue Guard lets them check their case into a secure storage room at the venue, then pick it up and return it as many times as needed throughout the tournament — so their cue is always available in the tournament room without the worry of it being lost or stolen.

---

## How It Works

| Step | Player Action | App Action |
|------|--------------|------------|
| **1. Check In** | Fill in name, tournament, table, and case description. Tap phone to NFC tag on case. | Registers the cue case and presents Apple Pay / Google Pay for the one-time storage fee. |
| **2. Secured** | Take a screenshot of the 6-digit claim code shown on screen. | Cue case status → **Checked In** (secure storage). |
| **3. Pick Up** | Before a match, tap phone to NFC tag. | Verifies the case and marks status → **Checked Out**. Player takes cue to the tables. |
| **4. Return** | After the match, tap phone to NFC tag at the storage desk. | Returns status → **Checked In** for safekeeping. |
| **5. Repeat** | Repeat pick-up / return as many times as needed during the tournament. | No extra charge — the initial fee covers the full tournament. |

---

## Features

- 📡 **NFC tap-to-pay** — uses the phone's built-in NFC chip; works with Apple Pay (iPhone) and Google Pay (Android)
- 🔒 **Secure storage** — cue cases are tracked in real time; no more unattended gear in the casino
- ♻️ **Unlimited pick-ups** — players check out and return their cue as many times as needed during the tournament, all on one flat fee
- 🎱 **Tournament-aware** — records player name, tournament name, and table number for easy identification
- 🔑 **Claim codes** — 6-digit code ties the player's phone to their case
- 📱 **Cross-platform** — React Native app runs on both iOS and Android

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native (Expo) |
| Navigation | React Navigation v6 |
| Payments | Stripe React Native (Apple Pay + Google Pay) |
| NFC | react-native-nfc-manager |
| Language | TypeScript |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode 15+ with an NFC-capable device (iPhone 7+)
- Android: Android 10+ device with NFC enabled

### Install

```bash
git clone https://github.com/Unwrenchable/Cue-guard.git
cd Cue-guard
npm install
```

### Configure Stripe

1. Create a Stripe account at <https://stripe.com>.
2. Copy your **publishable key** into `App.tsx`:
   ```ts
   const STRIPE_PUBLISHABLE_KEY = 'pk_live_YOUR_KEY_HERE';
   ```
3. Set the back-end base URL via the `CUE_GUARD_API_URL` environment variable (e.g. in a `.env` file):
   ```
   CUE_GUARD_API_URL=https://api.your-venue.com
   ```
4. Implement the `/create-payment-intent` endpoint on your server to create a Stripe PaymentIntent and return its `clientSecret`.

### Run

```bash
# Start Expo dev server
npm start

# iOS simulator (NFC not available in simulator — use a real device)
npm run ios

# Android
npm run android
```

### Run Tests

```bash
npm test
```

---

## Project Structure

```
src/
  components/
    BagCard.tsx        # CueCard – displays cue case details and status
    TapPayButton.tsx   # Native pay button (Apple Pay / Google Pay)
  navigation/
    AppNavigator.tsx   # Stack navigator with all screens
  screens/
    HomeScreen.tsx     # Lists all cue cases; entry point for all flows
    CheckInCueScreen   # (StoreBagScreen.tsx) Form + NFC scan + payment
    PickUpCueScreen    # (ClaimBagScreen.tsx) Tap NFC to check out cue
    ReturnCueScreen    # Tap NFC to return cue to storage after a match
    PaymentScreen      # Apple Pay / Google Pay sheet for storage fee
  services/
    NFCService.ts      # react-native-nfc-manager wrapper (iOS + Android)
    PaymentService.ts  # Stripe payment sheet (Apple Pay + Google Pay)
    BagStorageService  # In-memory cue case store (replace with real API)
  types/
    index.ts           # Shared TypeScript types
__tests__/             # Jest unit tests
```

---

## Android NFC Setup

Android requires the `NFC` permission and the NFC foreground dispatch. Both are already configured in `app.json`:

```json
"permissions": ["android.permission.NFC", "android.permission.VIBRATE"]
```

For Google Pay, the device must have Google Pay set up with at least one card.

## iOS NFC & Apple Pay Setup

`app.json` includes the required entitlement:

```json
"com.apple.developer.nfc.readersession.formats": ["TAG"]
```

Apple Pay requires a **Merchant ID** registered in the Apple Developer portal. Update `App.tsx`:

```ts
merchantIdentifier="merchant.com.your-venue.cueguard"
```

---

## License

MIT

