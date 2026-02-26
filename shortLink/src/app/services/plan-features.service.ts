import { computed, inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { PLAN_PRODUCT_IDS } from '../shared/consts/plan-product-ids.const';
import { PricingPlan } from '../shared/enums/pricing.enum';

@Injectable({ providedIn: 'root' })
export class PlanFeaturesService {
  private authService = inject(AuthService);

  productId   = computed(() => this.authService.user()?.subscription?.productId);
  isEssential = computed(() => this.productId() === PLAN_PRODUCT_IDS.ESSENTIAL);
  isPro       = computed(() => this.productId() === PLAN_PRODUCT_IDS.PRO);
  isUltimate  = computed(() => this.productId() === PLAN_PRODUCT_IDS.ULTIMATE);
  planName    = computed((): PricingPlan => {
    if (this.isEssential()) return PricingPlan.ESSENTIAL;
    if (this.isPro())       return PricingPlan.PRO;
    if (this.isUltimate())  return PricingPlan.ULTIMATE;
    return PricingPlan.FREE;
  });

  // Link creation flags
  canUsePasswordProtection = computed(() => !this.isEssential());
  canSetCustomExpiration   = computed(() => !this.isEssential());
  canSetNeverExpires       = computed(() => !this.isEssential());
  maxSuffixLength          = computed(() => this.isUltimate() ? null : 20);
  maxExpirationDate        = computed((): Date | null => {
    if (this.isEssential()) return null; // expiration field hidden for Essential
    if (this.isPro()) {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      return d;
    }
    return null; // Ultimate: no max
  });

  // Analytics flags
  analyticsRetentionDays   = computed(() => this.isEssential() ? 7 : this.isPro() ? 90 : null);
  topLinksCount            = computed(() => this.isEssential() ? 0 : this.isPro() ? 10 : 50);
  canExportAnalytics       = computed(() => !this.isEssential());
  canViewAdvancedAnalytics = computed(() => !this.isEssential()); // device + location breakdown

  // Usage display
  linksAllowed = computed(() => {
    const n = this.authService.user()?.subscription?.linksAllowed ?? 0;
    return n >= 999999 ? null : n; // null = display as "Unlimited"
  });
}
