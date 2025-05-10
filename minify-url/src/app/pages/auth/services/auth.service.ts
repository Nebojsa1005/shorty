import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Response } from '../../../shared/types/response.type';
import { User } from '../../../shared/types/user.type';
import { LocalStorageKeys } from '../../../shared/enums/local-storage.enum';
import { catchError, of, tap } from 'rxjs';
import { ToastServiceService } from '../../../shared/services/toast-service.service';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment.development';

interface AuthState {
  user: User | null;
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
  private toastService = inject(ToastServiceService);
  private router = inject(Router);

  state = signal<AuthState>({
    user: null,
  });

  user = computed(() => this.state().user);

  constructor() {
    const user = this.getUserFromLocalStorage();

    if (user) this.updateUser(user);
  }

  updateUser(newUser: User | null) {
    this.state.update((state) => ({
      ...state,
      user: newUser,
    }));
  }

  signUp(userData: UserCredentials) {
    return this.http
      .post<Response>(`${environment.apiUrl}/api/auth/sign-up`, {
        userData,
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

  signIn(userData: UserCredentials) {
    return this.http
      .post<Response>(`${environment.apiUrl}/api/auth/sign-in`, { userData })
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
  }

  getUserFromLocalStorage() {
    const userStringified = localStorage.getItem(LocalStorageKeys.USER);
    return userStringified ? JSON.parse(userStringified) : null;
  }

  logout() {
    localStorage.setItem(LocalStorageKeys.USER, '')
    this.updateUser(null)
    this.router.navigate(['auth/sign-in'])    
  }
}
