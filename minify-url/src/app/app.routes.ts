import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./pages/home/home.routes').then((r) => r.homeRoutes),
  },
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.routes').then(r => r.authRoutes)
  },
  {
    path: 'url',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/create-edit-url/create-edit-url.routes').then(m => m.routes)
  },
  { path: '**', redirectTo: '' },
];
