import { Component, computed, inject } from '@angular/core';
import { AccountInformationComponent } from './account-information/account-information.component';
import { AccountSubscriptionComponent } from './account-subscription/account-subscription.component';
import { AuthService } from 'src/app/services/auth.service';
import { PricingService } from 'src/app/services/pricing.service';

@Component({
  selector: 'app-profile',
  imports: [AccountInformationComponent, AccountSubscriptionComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  private authService = inject(AuthService);
  private pricingService = inject(PricingService);

  subscriptionProductName = computed(() =>
    this.pricingService.subscriptionProductName()
  );

  userSubscription = computed(() => this.user()?.subscription);
  user = computed(() => this.authService.user());
}
