import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./pages/auth/auth.routes').then((r) => r.authRoutes),
  },
  {
    path: '',
    loadChildren: () =>
      import('./pages/home/home.routes').then((r) => r.homeRoutes),
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: ''
  }
];
