import { Component, computed, inject, OnInit } from '@angular/core';
import { AccountInformationComponent } from './account-information/account-information.component';
import { AccountSubscriptionComponent } from './account-subscription/account-subscription.component';
import { BillingHistoryListComponent } from './account-subscription/billing-history-list/billing-history-list.component';
import { AuthService } from 'src/app/services/auth.service';
import { PricingService } from 'src/app/services/pricing.service';
import { SeoService } from 'src/app/core/services/seo.service';

@Component({
  selector: 'app-profile',
  imports: [AccountInformationComponent, AccountSubscriptionComponent, BillingHistoryListComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private pricingService = inject(PricingService);
  private seo = inject(SeoService);

  subscriptionProductName = computed(() =>
    this.pricingService.subscriptionProductName()
  );

  userSubscription = computed(() => this.user()?.subscription);
  user = computed(() => this.authService.user());

  ngOnInit(): void {
    this.seo.updateMeta({
      title: 'Profile — Minculum',
      description: 'Manage your Minculum account settings and subscription.',
      noindex: true,
    });
  }
}
