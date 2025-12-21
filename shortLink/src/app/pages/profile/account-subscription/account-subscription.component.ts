import {
  Component,
  computed,
  DestroyRef,
  inject,
  input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PricingService } from 'src/app/services/pricing.service';
import { User } from 'src/app/shared/types/user.type';
import { MatChip } from '@angular/material/chips';
import { MatButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { PricingPlan } from 'src/app/shared/enums/pricing.enum';

// Define tier order (lowest to highest)
const PLAN_ORDER = [PricingPlan.ESSENTIAL, PricingPlan.PRO, PricingPlan.ULTIMATE];

@Component({
  selector: 'app-account-subscription',
  imports: [MatChip, MatButton, MatIconModule, CommonModule],
  templateUrl: './account-subscription.component.html',
  styleUrl: './account-subscription.component.scss',
  standalone: true,
})
export class AccountSubscriptionComponent {
  private pricingService = inject(PricingService);
  private destroyRef = inject(DestroyRef);

  user = input.required<User | null>();
  userSubscription = computed(() => this.user()?.subscription);
  subscriptionProduct = computed(() => this.pricingService.subscriptionProduct());
  allProducts = computed(() => this.pricingService.products());

  userBillingHistory: any[] = [];

  // Get the next tier product (higher than current)
  nextTierProduct = computed(() => {
    const products = this.allProducts();
    const currentProduct = this.subscriptionProduct();

    if (!products || !currentProduct) return null;

    const currentPlanName = currentProduct.attributes?.name;
    const currentTierIndex = PLAN_ORDER.indexOf(currentPlanName as PricingPlan);

    // Find the next tier
    if (currentTierIndex === -1 || currentTierIndex >= PLAN_ORDER.length - 1) {
      return null; // Already on highest tier or unknown plan
    }

    const nextPlanName = PLAN_ORDER[currentTierIndex + 1];
    return products.find((p: any) => p.attributes?.name === nextPlanName) || null;
  });

  // Check if user is on the highest tier
  isHighestTier = computed(() => {
    const currentProduct = this.subscriptionProduct();
    if (!currentProduct) return false;

    const currentPlanName = currentProduct.attributes?.name;
    return currentPlanName === PricingPlan.ULTIMATE;
  });

  ngOnInit() {
    // Load current subscription product
    this.pricingService
      .getProductById(this.userSubscription()?.productId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();

    // Load all products to find next tier
    this.pricingService
      .getAllProducts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  getHistory() {
    this.pricingService
      .getBillingHistory(this.userSubscription()?.subscriptionId || '')
      .subscribe((e: any) => {
        this.userBillingHistory = e.data;
      });
  }

  onUpgrade() {
    const nextProduct = this.nextTierProduct();
    if (nextProduct?.attributes?.buy_now_url) {
      window.open(
        nextProduct.attributes.buy_now_url + '?checkout[custom][userId]=' + this.user()?._id,
        '_blank'
      );
    }
  }
}
