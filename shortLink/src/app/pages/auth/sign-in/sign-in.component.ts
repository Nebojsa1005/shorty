import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, computed, inject } from '@angular/core';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink, RouterModule } from '@angular/router';
import { take } from 'rxjs';
import { GoogleAuthService } from 'src/app/services/google-auth.service';
import { AuthService, UserCredentials } from '../../../services/auth.service';
import gsap from 'gsap';
import { prefersReducedMotion } from 'src/app/shared/utils/gsap-animations';

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
    RouterModule,
  ],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss',
})
export class SignInComponent implements AfterViewInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private googleAuthService = inject(GoogleAuthService);
  private el = inject(ElementRef<HTMLElement>);
  private gsapCtx?: gsap.Context;

  isSignInButtonLoading = computed(() => this.authService.isSignInButtonLoading());

  showPassword = false;
  formGroup: FormGroup<LoginForm>;

  get controls() { return this.formGroup.controls; }

  get emailErrorMessage() {
    if (this.controls.email.hasError('required')) return 'This Field is Required';
    return 'This is Not a Valid Email';
  }

  get passwordErrorMessage() {
    if (this.controls.email.hasError('required')) return 'This Field is Required';
    return 'Password Must Contain At Least 4 characters';
  }

  constructor() {
    this.formGroup = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  async ngAfterViewInit() {
    await this.googleAuthService.initializeGoogleSignIn();

    if (prefersReducedMotion()) return;

    this.gsapCtx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out', clearProps: 'all' } });
      tl.from('.auth-brand-panel', { opacity: 0, x: -30, duration: 0.6 })
        .from('.auth-logo--mobile, .form-header', { opacity: 0, y: 18, duration: 0.45 }, '-=0.3')
        .from('.google-area, .or-divider', { opacity: 0, y: 14, duration: 0.4, stagger: 0.06 }, '-=0.2')
        .from('mat-form-field', { opacity: 0, y: 12, duration: 0.35, stagger: 0.07 }, '-=0.15')
        .from('.submit-btn, .form-footer', { opacity: 0, y: 10, duration: 0.35, stagger: 0.05 }, '-=0.1');
    }, this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.gsapCtx?.revert();
  }

  signIn() {
    this.authService.updateState('isSignInButtonLoading', true);
    this.authService
      .signIn(this.formGroup.value as UserCredentials)
      .pipe(take(1))
      .subscribe(() => this.authService.updateState('isSignInButtonLoading', false));
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
