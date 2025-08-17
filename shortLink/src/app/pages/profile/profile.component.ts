import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { AuthService } from 'src/app/services/auth.service';
import { PricingService } from 'src/app/services/pricing.service';
import {
  EmailUpdatePayload,
  PasswordUpdatePayload,
} from 'src/app/shared/types/user.type';

@Component({
  selector: 'app-profile',
  imports: [
    MatButton,
    MatInput,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatIconButton,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private pricingService = inject(PricingService);

  user = computed(() => this.authService.user());
  userSubscription = computed(() => this.user()?.subscription);
  subscriptionProductName = computed(() => this.pricingService.subscriptionProductName())

  changeEmailForm = this.fb.group({
    newEmail: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  changePasswordForm = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required]],
  });

  isChangeEmail = signal(false);
  isPasswordChange = signal(false);
  showPassword = signal(false);

  // Getters
  get changeEmailControls() {
    return this.changeEmailForm.controls;
  }

  get changePasswordControls() {
    return this.changePasswordForm.controls;
  }

  ngOnInit() {
    this.pricingService
      .getProductById(this.userSubscription()?.productId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  togglePasswordVisibility() {
    this.showPassword.update((state) => !state);
  }

  onEmailChange() {
    this.isChangeEmail.update((state) => !state);
  }

  onUpdateEmail() {
    this.authService
      .updateUserEmail(this.changeEmailForm.getRawValue() as EmailUpdatePayload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  onPasswordChange() {
    this.isPasswordChange.update((state) => !state);
  }

  changePassword() {
    this.authService
      .updateUserPassword(
        this.changePasswordForm.getRawValue() as PasswordUpdatePayload
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
