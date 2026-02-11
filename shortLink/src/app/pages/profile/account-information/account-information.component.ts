import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/shared/types/user.type';

@Component({
  selector: 'app-account-information',
  imports: [
    MatButton,
    ReactiveFormsModule,
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

  // Personal Information Form
  personalInfoForm = this.fb.group({
    name: [''],
    email: ['', [Validators.required, Validators.email]],
  });

  // Password Form
  passwordForm = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: [''],
    confirmNewPassword: [''],
  });

  user = input.required<User | null>();

  showCurrentPassword = signal(false);
  showNewPassword = signal(false);

  get personalInfoFormControls() {
    return this.personalInfoForm.controls;
  }

  get passwordFormControls() {
    return this.passwordForm.controls;
  }

  ngOnInit() {
    this.presetForms();
  }

  toggleCurrentPasswordVisibility() {
    this.showCurrentPassword.update((state) => !state);
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword.update((state) => !state);
  }

  presetForms() {
    this.personalInfoForm.patchValue({
      name: this.user()?.name || '',
      email: this.user()?.email || '',
    });
  }

  updateUserInfo() {
    if (this.personalInfoForm.valid) {
      this.authService
        .updatePersonalInfo({
          name: this.personalInfoForm.value.name || '',
          email: this.personalInfoForm.value.email || '',
        })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
    }
  }

  updatePassword() {
    if (this.passwordForm.valid) {
      const { currentPassword, newPassword, confirmNewPassword } = this.passwordForm.value;

      if (newPassword !== confirmNewPassword) {
        return;
      }

      this.authService
        .updatePassword({
          currentPassword: currentPassword || '',
          newPassword: newPassword || '',
        })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.passwordForm.reset();
        });
    }
  }
}
