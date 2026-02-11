import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { Router } from '@angular/router';
import { UserInfoUpdatePayload, User } from '../shared/types/user.type';
import { LocalStorageKeys } from '../shared/enums/local-storage.enum';
import { environment } from '../../environments/environment';
import { Response } from '../shared/types/response.type';
import { ToastService } from './toast-service.service';

interface AuthState {
  user: User | null;
  userLoading: boolean;
  isSignInButtonLoading: boolean;
  isSignUpButtonLoading: boolean;
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
    userLoading: false,
    isSignInButtonLoading: false,
    isSignUpButtonLoading: false,
  });

  user = computed(() => this.state().user);
  userLoading = computed(() => this.state().userLoading);
  isSignInButtonLoading = computed(() => this.state().isSignInButtonLoading);
  isSignUpButtonLoading = computed(() => this.state().isSignUpButtonLoading);

  constructor() {
    // Migration: move old 'User' JSON object to new 'UserId' string
    const oldUserRaw = localStorage.getItem('User');
    if (oldUserRaw) {
      try {
        const oldUser = JSON.parse(oldUserRaw);
        if (oldUser?._id) {
          localStorage.setItem(LocalStorageKeys.USER_ID, oldUser._id);
        }
      } catch {}
      localStorage.removeItem('User');
    }

    const userId = this.getUserIdFromLocalStorage();
    if (userId) {
      this.loadUser(userId);
    }
  }

  updateState<K extends keyof AuthState>(prop: K, value: AuthState[K]) {
    this.state.update((state) => ({
      ...state,
      [prop]: value,
    }));
  }

  updateUser(newUser: User | null) {
    this.state.update((state) => ({
      ...state,
      user: newUser,
    }));
  }

  loadUser(userId: string) {
    this.state.update((state) => ({ ...state, userLoading: true }));

    this.http
      .get<Response>(
        `${environment.apiUrl}/api/auth/refresh-user/${userId}`
      )
      .pipe(
        tap((res) => {
          this.updateUser(res.data);
          this.state.update((state) => ({ ...state, userLoading: false }));
        }),
        catchError(() => {
          localStorage.removeItem(LocalStorageKeys.USER_ID);
          this.updateUser(null);
          this.state.update((state) => ({ ...state, userLoading: false }));
          return of(null);
        })
      )
      .subscribe();
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
          this.saveUserIdToLocalStorage(res.data.user._id);

          this.router.navigate(['/']);

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
          this.saveUserIdToLocalStorage(res.data.user._id);

          this.router.navigate(['/']);

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

  saveUserIdToLocalStorage(userId: string) {
    localStorage.setItem(LocalStorageKeys.USER_ID, userId);
  }

  getUserIdFromLocalStorage(): string | null {
    return localStorage.getItem(LocalStorageKeys.USER_ID);
  }

  logout() {
    localStorage.removeItem(LocalStorageKeys.USER_ID);
    this.updateUser(null);
    this.router.navigate(['auth/sign-in']);
  }

  updateUserEmail(payload: UserInfoUpdatePayload) {
    return this.http.put(
      `${environment.apiUrl}/api/auth/update-email/${this.user()?._id}`,
      payload
    );
  }

  updateUserInfo(payload: UserInfoUpdatePayload) {
    return this.http
      .put<Response>(
        `${environment.apiUrl}/api/auth/update-user-info/${this.user()?._id}`,
        payload
      )
      .pipe(
        tap((res) => {
          this.updateUser(res.data.user);

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

  refreshUser() {
    if (!this.user()?._id) return of(null);

    return this.http
      .get<Response>(
        `${environment.apiUrl}/api/auth/refresh-user/${this.user()?._id}`
      )
      .pipe(
        tap((res) => {
          this.updateUser(res.data);
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
}
