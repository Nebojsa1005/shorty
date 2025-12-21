import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { PricingService } from 'src/app/services/pricing.service';
import { PricingPlan } from 'src/app/shared/enums/pricing.enum';
import { IsSubscribedPipe } from 'src/app/shared/pipes/is-subscribed.pipe';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationComponent } from './dialogs/confirmation/confirmation.component';

@Component({
  selector: 'app-pricing',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    IsSubscribedPipe,
    CommonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    ConfirmationComponent,
  ],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PricingComponent {
  private pricingService = inject(PricingService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  PricingPlan = PricingPlan;

  products = computed(() => this.pricingService.products());
  user = computed(() => this.authService.user());
  userProduct = computed(() => this.user()?.subscription?.productId);

  constructor() {
    this.pricingService.getAllProducts().pipe(takeUntilDestroyed()).subscribe();
  }

  onBuyNow(buyNowUrl: string) {
    window.open(
      `${buyNowUrl}?checkout[custom][userId]=${this.user()?._id}`,
      '_blank'
    );

    this.openConfirmationDialog();
  }

  openConfirmationDialog() {
    this.dialog.open(ConfirmationComponent, {
      width: '400px',
    });
  }

  goHome() {
    this.router.navigate(['']);
  }
}
