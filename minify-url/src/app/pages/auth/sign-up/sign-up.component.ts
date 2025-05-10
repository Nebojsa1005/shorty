import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ionIcons } from '../../../../icons';
import { AuthService, UserCredentials } from '../services/auth.service';
import { take } from 'rxjs';
import { RouterLink } from '@angular/router';

interface SignUpForm {
  email: FormControl;
  password: FormControl;
}

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, RouterLink],
})
export class SignUpComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  icons = ionIcons;

  formGroup: FormGroup<SignUpForm>;

  get controls() {
    return this.formGroup.controls;
  }

  constructor() {
    this.formGroup = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  onSignUp() {
    this.authService
      .signUp(this.formGroup.value as UserCredentials)
      .pipe(take(1))
      .subscribe();
  }

  onGoogleLogin() {}
}
