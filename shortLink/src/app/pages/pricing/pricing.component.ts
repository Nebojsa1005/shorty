import { Component, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from 'src/app/services/auth.service';
import { PricingService } from 'src/app/services/pricing.service';

@Component({
  selector: 'app-pricing',
  imports: [],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss',
})
export class PricingComponent {
  private pricingService = inject(PricingService);
  private authService = inject(AuthService);

  products = computed(() => this.pricingService.products());
  user = computed(() => this.authService.user());

  constructor() {
    this.pricingService.getAllProducts().pipe(takeUntilDestroyed()).subscribe();
    this.pricingService.getSubscription('1286719').subscribe()
  }

  onBuyNow(buyNowUrl: string) {
    window.open(
      `${buyNowUrl}?checkout[custom][userId]=${this.user()?._id}`,
      '_blank'
    );
  }

  onCancel() {
    this.pricingService.cancelSubscription('1286719').subscribe()
  }
}
