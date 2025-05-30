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

interface SignUpForm {
  email: FormControl;
  password: FormControl;
}

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
})
export class SignUpComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  isSignUpButtonLoading = computed(() =>
    this.authService.isSignUpButtonLoading()
  );

  formGroup: FormGroup<SignUpForm>;
  showPassword = false;

  get controls() {
    return this.formGroup.controls;
  }

  constructor() {
    this.formGroup = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSignUp() {
    this.authService.updateState('isSignUpButtonLoading', true);
    this.authService
      .signUp(this.formGroup.value as UserCredentials)
      .pipe(take(1))
      .subscribe(() =>
        this.authService.updateState('isSignUpButtonLoading', false)
      );
  }

  onGoogleLogin() {}
}
