import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PricingService } from 'src/app/services/pricing.service';
import { User } from 'src/app/shared/types/user.type';
import { MatChip } from '@angular/material/chips';
import { MatButton } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-account-subscription',
  imports: [MatChip, MatButton, CommonModule],
  templateUrl: './account-subscription.component.html',
  styleUrl: './account-subscription.component.scss',
  standalone: true,
})
export class AccountSubscriptionComponent {
  private pricingService = inject(PricingService);
  private destroyRef = inject(DestroyRef);

  user = input.required<User | null>();
  userSubscription = computed(() => this.user()?.subscription);
  subscriptionProduct = computed(() =>
    this.pricingService.subscriptionProduct()
  );

  userBillingHistory: any[] = []
  
  constructor() {
    effect(() => console.log(this.subscriptionProduct()));
  }

  ngOnInit() {
    this.pricingService
      .getProductById(this.userSubscription()?.productId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  getHistory() {
    this.pricingService
      .getBillingHistory(this.userSubscription()?.subscriptionId || '')
      .subscribe((e: any) => {
        console.log(e);
        
        this.userBillingHistory = e.data;
      });
  }
}
