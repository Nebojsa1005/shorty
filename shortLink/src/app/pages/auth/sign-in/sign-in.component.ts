import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { take } from 'rxjs';
import { AuthService, UserCredentials } from '../../../services/auth.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface LoginForm {
  email: FormControl;
  password: FormControl;
}

@Component({
    selector: 'app-sign-in',
    imports: [
        CommonModule,
        RouterLink,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatDividerModule,
        MatProgressSpinnerModule,
    ],
    templateUrl: './sign-in.component.html',
    styleUrl: './sign-in.component.scss'
})
export class SignInComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  isSignInButtonLoading = computed(() =>
    this.authService.isSignInButtonLoading()
  );

  showPassword = false;
  formGroup: FormGroup<LoginForm>;

  get controls() {
    return this.formGroup.controls;
  }

  get emailErrorMessage() {
    if (this.controls.email.hasError('required')) {
      return 'This Field is Required';
    } else {
      return 'This is Not a Valid Email';
    }
  }

  get passwordErrorMessage() {
    if (this.controls.email.hasError('required')) {
      return 'This Field is Required';
    } else {
      return 'Password Must Contain At Least 4 characters';
    }
  }

  constructor() {
    this.formGroup = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  signIn() {
    this.authService.updateState('isSignInButtonLoading', true);
    this.authService
      .signIn(this.formGroup.value as UserCredentials)
      .pipe(take(1))
      .subscribe(() =>
        this.authService.updateState('isSignInButtonLoading', false)
      );
  }

  onGoogleLogin() {
    this.authService.googleLogin().pipe(take(1)).subscribe();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
