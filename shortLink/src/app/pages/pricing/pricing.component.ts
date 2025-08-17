import { Component, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { PricingService } from 'src/app/services/pricing.service';
import { IsSubscribedPipe } from 'src/app/shared/pipes/is-subscribed.pipe';

@Component({
  selector: 'app-pricing',
  imports: [MatToolbarModule, MatButtonModule, IsSubscribedPipe],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss',
})
export class PricingComponent {
  private pricingService = inject(PricingService);
  private authService = inject(AuthService);
  private router = inject(Router)

  products = computed(() => this.pricingService.products());
  user = computed(() => this.authService.user());
  userProduct = computed(() => this.user()?.subscription?.productId)

  constructor() {
    this.pricingService.getAllProducts().pipe(takeUntilDestroyed()).subscribe();
  }

  onBuyNow(buyNowUrl: string) {
    window.open(
      `${buyNowUrl}?checkout[custom][userId]=${this.user()?._id}`,
      '_blank'
    );
  }

  onCancel() {
    this.pricingService.cancelSubscription()
  }

  goHome() {
    this.router.navigate([''])
  }
}
