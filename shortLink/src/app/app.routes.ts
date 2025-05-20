import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/create-edit-link/create-edit-link.component').then(
        (m) => m.CreateEditLinkComponent
      ),
  },
  {
    path: 'edit/:id',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/create-edit-link/create-edit-link.component').then(
        (m) => m.CreateEditLinkComponent
      ),
  },
  {
    path: 'all-links',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/all-links/all-links.component').then(
        (m) => m.AllLinksComponent
      ),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./pages/auth/auth.routes').then((r) => r.authRoutes),
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/view-link/view-link.component').then(m => m.ViewLinkComponent)
  },
  {
    path: ':suffix/:id',
    loadComponent: () => import('./pages/view-link/view-link.component').then(m => m.ViewLinkComponent)
  }
];
