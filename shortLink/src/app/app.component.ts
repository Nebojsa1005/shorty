import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { SocketService } from './services/socket.service';
import { AuthService } from './services/auth.service';
import { PricingService } from './services/pricing.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  trigger,
  transition,
  style,
  animate,
  query,
} from '@angular/animations';

export const routerFadeAnimation = trigger('routerTransition', [
  transition('* <=> *', [
    query(
      ':enter',
      [
        style({ opacity: 0, transform: 'translateY(8px)' }),
        animate('220ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ],
      { optional: true }
    ),
  ]),
]);

@Component({
  selector: 'app-root',
  imports: [RouterModule, RouterOutlet, CommonModule],
  animations: [routerFadeAnimation],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private socketService = inject(SocketService);
  private authService = inject(AuthService);
  private pricingService = inject(PricingService);

  user = computed(() => this.authService.user());

  constructor() {
    this.pricingService.getAllProducts().pipe(takeUntilDestroyed()).subscribe();

    effect(() => {
      const user = this.user();

      if (user?._id) {
        this.socketService.joinRoom();
      }

      if (user?.subscription) {
        this.pricingService.getProductById(user.subscription.productId);
      } else {
        this.pricingService.updateState('subscriptionProduct', null);
      }
    });
  }

  getRouteState(outlet: RouterOutlet): string {
    if (!outlet?.isActivated) return '';
    return outlet.activatedRouteData?.['animation'] ?? outlet.activatedRoute.snapshot.url.join('/') ?? '';
  }
}
