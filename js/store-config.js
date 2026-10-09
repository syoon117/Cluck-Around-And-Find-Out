// Store settings for the app-store builds. The web version ignores all of this and uses eggs.
// When the RevenueCat account and the store products exist:
//   1. paste the public SDK keys from RevenueCat (Project settings > API keys)
//   2. set realMoney: true
//   3. npm run cap:sync, then build in Xcode / Android Studio
window.CLUCK_STORE_CONFIG = {
  realMoney: false,
  revenueCatAppleKey: '',   // starts with appl_
  revenueCatGoogleKey: '',  // starts with goog_
};
