import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, of, take, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { ToastService } from './toast-service.service';
import { Response } from '../shared/types/response.type';
import { jwtDecode } from 'jwt-decode';
import { environment } from 'src/environments/environment';

declare const google: any;

@Injectable({
  providedIn: 'root',
})
export class GoogleAuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  async initializeGoogleSignIn() {
    await google.accounts.id.initialize({
      client_id: `${environment.oAuthClientId}`,
      callback: (response: any) => this.handleCredentialResponse(response),
    });

    await google.accounts.id.renderButton(
      document.getElementById('google-signin-button'),
      { theme: 'outline', size: 'large' } // customization attributes
    );

  }

  handleCredentialResponse(response: any) {
    const token = response.credential;
    const decoded: any = jwtDecode(token);
    const userEmail = decoded.email;

    this.googleSignIn(userEmail).pipe(take(1)).subscribe();
  }

  googleSignIn(userEmail: string) {
    return this.http
      .post<Response>(`${environment.apiUrl}/api/auth/google-login`, {
        userEmail,
      })
      .pipe(
        tap((res) => {
          this.authService.updateUser(res.data.user);
          this.authService.saveUserIdToLocalStorage(res.data.user._id);

          this.router.navigate(['/']);

          this.toastService.presentToast({
            position: 'bottom',
            message: res.message,
            duration: 3000,
            color: 'primary',
          });
        }),
        catchError((error) => {
          this.toastService.presentToast({
            position: 'bottom',
            message: error.error.message,
            color: 'danger',
          });
          return of(null);
        })
      );
  }
}
