import { PRODUCT_IDS } from "../models/subscription.model";

export interface PlanFeatureConfig {
  canUsePassword: boolean;
  maxSuffixLength: number | null;   // null = unlimited
  maxExpirationDays: number | null; // null = unlimited; Essential=30, Pro=365
  canNeverExpire: boolean;
  analyticsRetentionDays: number | null; // null = all time
  topLinksCount: number;            // 0 for Essential (feature unavailable)
  canExportAnalytics: boolean;
}

const planFeaturesMap: Record<string, PlanFeatureConfig> = {
  [PRODUCT_IDS[541888]]: { canUsePassword: false, maxSuffixLength: 20,   maxExpirationDays: 30,  canNeverExpire: false, analyticsRetentionDays: 7,  topLinksCount: 0,  canExportAnalytics: false },
  [PRODUCT_IDS[542010]]: { canUsePassword: true,  maxSuffixLength: 20,   maxExpirationDays: 365, canNeverExpire: true,  analyticsRetentionDays: 90, topLinksCount: 10, canExportAnalytics: true  },
  [PRODUCT_IDS[542013]]: { canUsePassword: true,  maxSuffixLength: null, maxExpirationDays: null, canNeverExpire: true,  analyticsRetentionDays: null, topLinksCount: 50, canExportAnalytics: true },
};

const defaultFeatures = planFeaturesMap[PRODUCT_IDS[541888]];

export const getPlanFeaturesForProduct = (productId: string | undefined): PlanFeatureConfig => {
  if (!productId) return defaultFeatures;
  return planFeaturesMap[productId] ?? defaultFeatures;
};
