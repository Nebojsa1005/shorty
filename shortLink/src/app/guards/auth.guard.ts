import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  private router = inject(Router);
  private authService = inject(AuthService);

  user = this.authService.getUserFromLocalStorage();

  async canActivate() {
    if (!this.user) {
      this.router.navigate(['auth/sign-up']);
      return false;
    }

    return true;
  }
}
