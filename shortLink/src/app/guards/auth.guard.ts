import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  private router = inject(Router);
  private authService = inject(AuthService);
  private userLoading$ = toObservable(this.authService.userLoading);

  canActivate(): boolean | Observable<boolean> {
    const userId = this.authService.getUserIdFromLocalStorage();

    if (!userId) {
      this.router.navigate(['auth/sign-up']);
      return false;
    }

    if (this.authService.user()) {
      return true;
    }

    if (this.authService.userLoading()) {
      return this.userLoading$.pipe(
        filter((loading) => !loading),
        map(() => {
          if (this.authService.user()) {
            return true;
          }
          this.router.navigate(['auth/sign-in']);
          return false;
        })
      );
    }

    this.router.navigate(['auth/sign-in']);
    return false;
  }
}
