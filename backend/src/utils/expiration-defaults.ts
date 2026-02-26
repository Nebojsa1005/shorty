import { PRODUCT_IDS } from "../models/subscription.model";

export interface ExpirationConfig {
  planExpirationDays: number | null;
  deleteAfterExpiredDays: number | null;
}

// Product IDs from subscription.model.ts (PRODUCT_LINKS_ALLOWED)
// 541888 = Essential, 542010 = Pro, 542013 = Ultimate
const expirationConfigMap: Record<string, ExpirationConfig> = {
  [PRODUCT_IDS[541888]]: { planExpirationDays: 30, deleteAfterExpiredDays: 30 },
  [PRODUCT_IDS[542010]]: { planExpirationDays: 90,   deleteAfterExpiredDays: 90  }, // Pro: auto-expires after 90 days, 90-day retention after expiry
  [PRODUCT_IDS[542013]]: { planExpirationDays: null, deleteAfterExpiredDays: null },
};

const defaultConfig: ExpirationConfig = {
  planExpirationDays: 30,
  deleteAfterExpiredDays: 30,
};

export const getExpirationConfigForProduct = (
  productId: string | undefined
): ExpirationConfig => {
  if (!productId) return defaultConfig;
  return expirationConfigMap[productId] ?? defaultConfig;
};
