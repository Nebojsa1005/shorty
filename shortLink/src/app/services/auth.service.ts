import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, of, tap } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../shared/types/user.type';
import { LocalStorageKeys } from '../shared/enums/local-storage.enum';
import { environment } from '../../environments/environment';
import { Response } from '../shared/types/response.type';
import { ToastService } from './toast-service.service';

interface AuthState {
  user: User | null;
  isSignInButtonLoading: boolean
  isSignUpButtonLoading: boolean
}

export interface UserCredentials {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private toastService = inject(ToastService);
  private router = inject(Router);

  state = signal<AuthState>({
    user: null,
    isSignInButtonLoading: false,
    isSignUpButtonLoading: false
  });

  user = computed(() => this.state().user);
  isSignInButtonLoading = computed(() => this.state().isSignInButtonLoading)
  isSignUpButtonLoading = computed(() => this.state().isSignUpButtonLoading)

  constructor() {
    const user = this.getUserFromLocalStorage();

    if (user) this.updateUser(user);
  }

  updateState<K extends keyof AuthState>(prop: K, value: AuthState[K]) {
    this.state.update(state => ({
      ...state,
      [prop]: value
    }))
  }

  updateUser(newUser: User | null) {
    this.state.update((state) => ({
      ...state,
      user: newUser,
    }));
  }

  signUp(userData: UserCredentials) {
    return this.http
      .post<Response>(
        `${environment.apiUrl}/api/auth/sign-up`,
        {
          userData,
        },
        { withCredentials: true }
      )
      .pipe(
        tap((res) => {
          this.updateUser(res.data.user);
          this.saveUserToLocalStorage(res.data.user);

          this.router.navigate(['']);

          this.toastService.presentToast({
            position: 'top',
            message: res.message,
            duration: 3000,
            color: 'primary',
          });
        }),
        catchError((error) => {
          this.toastService.presentToast({
            position: 'top',
            message: error.error.message,
            color: 'danger',
          });
          return of(null);
        })
      );
  }

  signIn(userData: UserCredentials) {
    return this.http
      .post<Response>(
        `${environment.apiUrl}/api/auth/sign-in`,
        { userData },
        { withCredentials: true }
      )
      .pipe(
        tap((res) => {
          this.updateUser(res.data.user);
          this.saveUserToLocalStorage(res.data.user);

          this.router.navigate(['']);

          this.toastService.presentToast({
            position: 'top',
            message: res.message,
            duration: 3000,
            color: 'primary',
          });
        }),
        catchError((error) => {
          this.toastService.presentToast({
            position: 'top',
            message: error.error.message,
            color: 'danger',
          });
          return of(null);
        })
      );
  }

  googleLogin() {
    return this.http
      .get<Response>('http://localhost:3000/api/auth/google-login', {
        withCredentials: true,
      })
      .pipe(
        tap((res) => {
          this.updateUser(res.data);
          this.saveUserToLocalStorage(res.data);

          this.router.navigate(['']);

          this.toastService.presentToast({
            position: 'top',
            message: res.message,
            duration: 3000,
            color: 'primary',
          });
        }),
        catchError((error) => {
          this.toastService.presentToast({
            position: 'top',
            message: error.error.message,
            color: 'danger',
          });
          return of(null);
        })
      );
  }

  saveUserToLocalStorage(user: User) {
    const userStringified = JSON.stringify(user);
    localStorage.setItem(LocalStorageKeys.USER, userStringified);
    console.log('upisan', {
      userStringified,
      local: this.getUserFromLocalStorage()
    });
    
  }

  getUserFromLocalStorage() {
    const userStringified = localStorage.getItem(LocalStorageKeys.USER);
    return userStringified ? JSON.parse(userStringified) : null;
  }

  logout() {
    localStorage.setItem(LocalStorageKeys.USER, '');
    this.updateUser(null);
    this.router.navigate(['auth/sign-in']);
  }
}
