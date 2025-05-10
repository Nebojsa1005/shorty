import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { take } from 'rxjs';
import { ionIcons } from '../../../../icons';
import { AuthService, UserCredentials } from '../services/auth.service';
import { EmailRegEx } from '../../../shared/regex/regex';

interface LoginForm {
  email: FormControl;
  password: FormControl;
}

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, RouterLink],
})
export class SignInComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  icons = ionIcons;

  formGroup: FormGroup<LoginForm>;

  get controls() {
    return this.formGroup.controls;
  }

  get emailErrorMessage() {
    if (this.controls.email.hasError('required')) {
      return 'This Field is Required'
    } else {
      return 'This is Not a Valid Email'
    }
  }

  get passwordErrorMessage() {
    if (this.controls.email.hasError('required')) {
      return 'This Field is Required'
    } else {
      return 'Password Must Contain At Least 4 characters'
    }
  }

  constructor() {
    this.formGroup = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(EmailRegEx)]],
      password: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  signIn() {
    this.authService
      .signIn(this.formGroup.value as UserCredentials)
      .pipe(take(1))
      .subscribe();
  }

  onGoogleLogin() {
    this.authService.googleLogin().pipe(take(1)).subscribe();
  }
}
