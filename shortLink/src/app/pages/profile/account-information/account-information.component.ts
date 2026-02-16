import { Component, computed, DestroyRef, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
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

  private personalInfoChanges = toSignal(this.personalInfoForm.valueChanges, {
    initialValue: this.personalInfoForm.value,
  });

  private passwordChanges = toSignal(this.passwordForm.valueChanges, {
    initialValue: this.passwordForm.value,
  });

  isPersonalInfoEditDisabled = computed(() => {
    const current = this.personalInfoChanges();
    const user = this.user();
    const name = (current.name || '').trim();
    const email = (current.email || '').trim();

    if (!name && !email) return true;

    const nameUnchanged = name === (user?.name || '');
    const emailUnchanged = email === (user?.email || '');
    return nameUnchanged && emailUnchanged;
  });

  passwordMismatch = computed(() => {
    const current = this.passwordChanges();
    const newPw = (current.newPassword || '').trim();
    const confirmPw = (current.confirmNewPassword || '').trim();
    return newPw.length > 0 && confirmPw.length > 0 && newPw !== confirmPw;
  });

  isPasswordEditDisabled = computed(() => {
    const current = this.passwordChanges();
    const currentPw = (current.currentPassword || '').trim();
    const newPw = (current.newPassword || '').trim();
    const confirmPw = (current.confirmNewPassword || '').trim();

    if (!currentPw || !newPw || !confirmPw) return true;
    if (newPw !== confirmPw) return true;
    return false;
  });

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
