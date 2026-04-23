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
import { RouterLink } from '@angular/router';
import { take } from 'rxjs';
import { AuthService, UserCredentials } from '../../../services/auth.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GoogleAuthService } from 'src/app/services/google-auth.service';
import gsap from 'gsap';
import { prefersReducedMotion } from 'src/app/shared/utils/gsap-animations';

interface SignUpForm {
  email: FormControl;
  password: FormControl;
}

@Component({
  selector: 'app-sign-up',
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
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
})
export class SignUpComponent implements AfterViewInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private googleAuthService = inject(GoogleAuthService);
  private el = inject(ElementRef<HTMLElement>);
  private gsapCtx?: gsap.Context;

  isSignUpButtonLoading = computed(() => this.authService.isSignUpButtonLoading());

  formGroup: FormGroup<SignUpForm>;
  showPassword = false;

  get controls() { return this.formGroup.controls; }

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
      .subscribe(() => this.authService.updateState('isSignUpButtonLoading', false));
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
}
