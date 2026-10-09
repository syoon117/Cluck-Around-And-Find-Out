// Connects the shop to Apple / Google in-app purchases through RevenueCat, inside the Capacitor
// app only. On the web, or until store-config.js is filled in, the shop keeps using eggs.
(function () {
  const cap = window.Capacitor;
  const config = window.CLUCK_STORE_CONFIG || {};
  const store = window.CluckStore;
  if (!cap || !cap.isNativePlatform || !cap.isNativePlatform() || !store) return;
  const apiKey = cap.getPlatform() === 'ios' ? config.revenueCatAppleKey : config.revenueCatGoogleKey;
  if (!config.realMoney || !apiKey) return;

  const Purchases = cap.registerPlugin('Purchases'); // native plugin from @revenuecat/purchases-capacitor
  const ready = Purchases.configure({ apiKey });
  const cancelled = (e) => !!(e && (e.userCancelled || (e.data && e.data.userCancelled) || String(e.code) === '1'));

  window.CluckIAP = {
    // resolves true when paid, false when the player backs out; throws on real errors
    async purchase(productId) {
      await ready;
      const { products } = await Purchases.getProducts({ productIdentifiers: [productId], type: 'NON_SUBSCRIPTION' });
      if (!products || !products.length) throw new Error(`Product ${productId} isn't set up in the store yet.`);
      try {
        await Purchases.purchaseStoreProduct({ product: products[0] });
        return true;
      } catch (e) {
        if (cancelled(e)) return false;
        throw e;
      }
    },
    // every product id this player has bought, for "Restore purchases" (required by Apple)
    async restore() {
      await ready;
      const { customerInfo } = await Purchases.restorePurchases();
      return (customerInfo.nonSubscriptionTransactions || []).map((t) => t.productIdentifier);
    },
  };
  store.mode = 'money';
  store.restorable = true;
})();
