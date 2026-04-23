import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  signal,
} from '@angular/core';
import gsap from 'gsap';
import { prefersReducedMotion } from 'src/app/shared/utils/gsap-animations';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { PricingService } from 'src/app/services/pricing.service';
import { PricingPlan } from 'src/app/shared/enums/pricing.enum';
import { IsSubscribedPipe } from 'src/app/shared/pipes/is-subscribed.pipe';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationComponent } from './dialogs/confirmation/confirmation.component';
import { SocketService } from 'src/app/services/socket.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-pricing',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    IsSubscribedPipe,
    CommonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    ConfirmationComponent,
  ],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PricingComponent implements AfterViewInit, OnDestroy {
  private pricingService = inject(PricingService);
  private authService = inject(AuthService);
  private socketService = inject(SocketService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  PricingPlan = PricingPlan;

  products = computed(() => this.pricingService.products());
  user = computed(() => this.authService.user());
  userProduct = computed(() => this.user()?.subscription?.productId);

  private el = inject(ElementRef<HTMLElement>);
  private gsapCtx?: gsap.Context;
  private currentDialogRef: MatDialogRef<ConfirmationComponent> | null = null;
  isCheckoutOpen = signal(false);

  constructor() {

    // Listen for payment success
    this.socketService.paymentSuccess$
      .pipe(takeUntilDestroyed())
      .subscribe((data) => {
        console.log('Payment success received:', data);
        if (this.currentDialogRef) {
          this.currentDialogRef.componentInstance.updateStatus('success', data.message);
          // Auto-close dialog after 3 seconds
          setTimeout(() => {
            this.currentDialogRef?.close();
            this.currentDialogRef = null;
          }, 3000);
        } else {
          this.snackBar.open(data.message, 'Close', {
            duration: 5000,
            panelClass: ['success-snackbar'],
          });
        }
      });

    // Listen for payment failure
    this.socketService.paymentFailed$
      .pipe(takeUntilDestroyed())
      .subscribe((data) => {
        console.error('Payment failed received:', data);
        if (this.currentDialogRef) {
          this.currentDialogRef.componentInstance.updateStatus('failed', data.message);
        } else {
          this.snackBar.open(data.message, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
        }
      });

    // Listen for subscription updates
    this.socketService.subscriptionUpdated$
      .pipe(takeUntilDestroyed())
      .subscribe((data) => {
        console.log('Subscription updated received:', data);
        // Close dialog if subscription is updated (created/cancelled)
        if (this.currentDialogRef &&
            (data.eventType === 'subscription_created' ||
             data.eventType === 'subscription_updated')) {
          this.currentDialogRef.componentInstance.updateStatus('success', 'Your subscription has been updated successfully!');
          setTimeout(() => {
            this.currentDialogRef?.close();
            this.currentDialogRef = null;
          }, 3000);
        }

        if (data.eventType === 'subscription_cancelled') {
          this.snackBar.open('Your subscription has been cancelled.', 'Close', {
            duration: 5000,
          });
        }
      });
  }


  ngAfterViewInit(): void {
    if (prefersReducedMotion()) return;
    this.gsapCtx = gsap.context(() => {
      gsap.from('.pricing-card', {
        opacity: 0,
        y: 28,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
        clearProps: 'all',
      });
    }, this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.gsapCtx?.revert();
  }

  onBuyNow(buyNowUrl: string) {
    if (this.isCheckoutOpen()) return;

    this.isCheckoutOpen.set(true);
    window.open(
      `${buyNowUrl}?checkout[custom][userId]=${this.user()?._id}`,
      '_blank'
    );

    this.openConfirmationDialog();
  }

  openConfirmationDialog() {
    this.currentDialogRef = this.dialog.open(ConfirmationComponent, {
      width: '400px',
      disableClose: true,
    });

    this.currentDialogRef.afterClosed().subscribe(() => {
      this.currentDialogRef = null;
      this.isCheckoutOpen.set(false);
    });
  }

  goHome() {
    this.router.navigate(['']);
  }
}
