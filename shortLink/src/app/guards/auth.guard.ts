import { computed, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  private router = inject(Router);
  private authService = inject(AuthService);

  localUser = this.authService.getUserFromLocalStorage();
  user = computed(() => this.authService.user());

  async canActivate() {
    console.log({
      a: this.localUser,
      b: this.user,
    });

    if (!this.localUser || !this.user()) {
      this.router.navigate(['auth/sign-up']);
      return false;
    }

    return true;
  }
}
