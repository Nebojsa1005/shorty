import {
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { PricingService } from 'src/app/services/pricing.service';
import { User } from 'src/app/shared/types/user.type';
import { MatChip } from '@angular/material/chips';
import { MatButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { PricingPlan } from 'src/app/shared/enums/pricing.enum';
import { Router } from '@angular/router';

const PLAN_ORDER = [PricingPlan.ESSENTIAL, PricingPlan.PRO, PricingPlan.ULTIMATE];

@Component({
  selector: 'app-account-subscription',
  imports: [MatChip, MatButton, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule, CommonModule],
  templateUrl: './account-subscription.component.html',
  styleUrl: './account-subscription.component.scss',
  standalone: true,
})
export class AccountSubscriptionComponent {
  private pricingService = inject(PricingService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  user = input.required<User | null>();
  userSubscription = computed(() => this.user()?.subscription);
  subscriptionProduct = computed(() => this.pricingService.subscriptionProduct());
  allProducts = computed(() => this.pricingService.products());

  showCancelConfirm = signal(false);
  isCancelling = signal(false);

  hasSubscription = computed(() => !!this.userSubscription()?.productId);

  nextTierProduct = computed(() => {
    const products = this.allProducts();

    if (!products) return null;

    if (!this.hasSubscription()) {
      return products.find((p: any) => p.attributes?.name === PricingPlan.ESSENTIAL) || null;
    }

    const currentProduct = this.subscriptionProduct();
    if (!currentProduct) return null;

    const currentPlanName = currentProduct.attributes?.name;
    const currentTierIndex = PLAN_ORDER.indexOf(currentPlanName as PricingPlan);

    if (currentTierIndex === -1 || currentTierIndex >= PLAN_ORDER.length - 1) {
      return null;
    }

    const nextPlanName = PLAN_ORDER[currentTierIndex + 1];
    return products.find((p: any) => p.attributes?.name === nextPlanName) || null;
  });

  isHighestTier = computed(() => {
    const currentProduct = this.subscriptionProduct();
    if (!currentProduct) return false;
    return currentProduct.attributes?.name === PricingPlan.ULTIMATE;
  });

  ngOnInit() {
    const productId = this.userSubscription()?.productId;
    if (productId) {
      this.pricingService
        .getProductById(productId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
    }

    this.pricingService
      .getAllProducts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  onCancelSubscription() {
    this.showCancelConfirm.set(true);
  }

  onConfirmCancel() {
    this.isCancelling.set(true);
    this.showCancelConfirm.set(false);

    this.pricingService.cancelSubscription()
      .pipe(
        finalize(() => this.isCancelling.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => {
        if (result !== null) {
          this.snackBar.open('Your subscription has been cancelled.', 'Close', { duration: 5000 });
        }
      });
  }

  onDismissCancel() {
    this.showCancelConfirm.set(false);
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

  onChangePlan() {
    this.router.navigate(['pricing']);
  }
}
