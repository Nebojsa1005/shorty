import { inject, Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
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

  canActivate(): boolean | UrlTree | Observable<boolean | UrlTree> {
    const userId = this.authService.getUserIdFromLocalStorage();

    if (!userId) {
      return this.router.createUrlTree(['landing']);
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
          return this.router.createUrlTree(['auth/sign-in']);
        })
      );
    }

    return this.router.createUrlTree(['auth/sign-in']);
  }
}
