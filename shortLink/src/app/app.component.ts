import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SocketService } from './services/socket.service';
import { AuthService } from './services/auth.service';
import { PricingService } from './services/pricing.service';

@Component({
  selector: 'app-root',
  imports: [RouterModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private socketService = inject(SocketService);
  private authService = inject(AuthService);
  private pricingService = inject(PricingService);

  user = computed(() => this.authService.user());

  constructor() {
    

    effect(() => {
      const user = this.user();

      if (user?._id) {
        this.socketService.joinRoom();
      }

      if (user?.subscription) {
        this.pricingService.getProductById(user.subscription.productId);
      }
    });
  }
}
