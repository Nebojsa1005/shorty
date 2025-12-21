import { Component, computed, DestroyRef, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { AuthService } from 'src/app/services/auth.service';
import { User, UserInfoUpdatePayload } from 'src/app/shared/types/user.type';

@Component({
  selector: 'app-account-information',
  imports: [
    MatButton,
    MatInput,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatIconButton,
  ],
  templateUrl: './account-information.component.html',
  styleUrl: './account-information.component.scss',
  standalone: true,
})
export class AccountInformationComponent {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  userInfoForm = this.fb.group({
    email: ['', [Validators.required]],
    password: ['', [Validators.required]],
    newPassword: [''],
  });

  user = input.required<User | null>();

  isChangeEmail = signal(false);
  isPasswordChange = signal(false);
  showPassword = signal(false);

  // Getters
  get userInfoFormControls() {
    return this.userInfoForm.controls;
  }

  ngOnInit() {
    this.presetUserInfoForm();
  }

  togglePasswordVisibility() {
    this.showPassword.update((state) => !state);
  }

  onEmailChange() {
    this.isChangeEmail.update((state) => !state);
  }

  onPasswordChange() {
    this.isPasswordChange.update((state) => !state);
  }

  presetUserInfoForm() {
    this.userInfoForm.patchValue({
      email: this.user()?.email,
    });
    this.userInfoForm.updateValueAndValidity();
  }

  updateUserInfo() {
    this.authService
      .updateUserInfo(this.userInfoForm.getRawValue() as UserInfoUpdatePayload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
