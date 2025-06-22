import { Component, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from 'src/app/services/auth.service';
import { PricingService } from 'src/app/services/pricing.service';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-pricing',
  imports: [],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss',
})
export class PricingComponent {
  private pricingService = inject(PricingService);
  private authService = inject(AuthService);

  private socket: Socket;

  products = computed(() => this.pricingService.products());
  user = computed(() => this.authService.user());

  constructor() {
    this.socket = io(environment.apiUrl);

    this.socket.emit('join', this.user()?._id as string)
    this.socket.on('subscription-updated', (data) => console.log(data));

    this.pricingService.getAllProducts().pipe(takeUntilDestroyed()).subscribe();
    this.pricingService
      .getSubscription(this.user()?.subscription.subscriptionId as string)
      .subscribe();
  }

  onBuyNow(buyNowUrl: string) {
    window.open(
      `${buyNowUrl}?checkout[custom][userId]=${this.user()?._id}`,
      '_blank'
    );
  }

  onCancel() {
    this.pricingService.cancelSubscription().subscribe();
  }
}
