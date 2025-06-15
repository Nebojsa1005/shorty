import { Component, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PricingService } from 'src/app/services/pricing.service';

@Component({
  selector: 'app-pricing',
  imports: [],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss',
})
export class PricingComponent {
  private pricingService = inject(PricingService);

  products = computed(() => this.pricingService.products());

  constructor() {
    this.pricingService.getAllProducts().pipe(takeUntilDestroyed()).subscribe();
  }

  onBuyNow(buyNowUrl: string) {
    window.location.href = `${buyNowUrl}[custom][userId]=${1234}`;
  }
}
