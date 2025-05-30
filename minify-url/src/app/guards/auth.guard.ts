import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../pages/auth/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  private router = inject(Router);
  private authService = inject(AuthService);

  user = this.authService.getUserFromLocalStorage();

  async canActivate(route: ActivatedRouteSnapshot) {
    if (!this.user) {
      this.router.navigate(['auth/sign-up']);
      return false;
    }

    return true;
  }
}
