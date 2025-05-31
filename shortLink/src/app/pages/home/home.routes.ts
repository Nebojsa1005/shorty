import { Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';

export const homeRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'all-links',
  },
  {
    path: '',
    loadComponent: () =>
      import('./home.component').then((c) => c.HomeComponent),
    children: [
      {
        path: 'new-link',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('../create-edit-link/create-edit-link.component').then(
            (m) => m.CreateEditLinkComponent
          ),
      },
      {
        path: 'edit/:id',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('../create-edit-link/create-edit-link.component').then(
            (m) => m.CreateEditLinkComponent
          ),
      },
      {
        path: 'all-links',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('../all-links/all-links.component').then(
            (m) => m.AllLinksComponent
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('../view-link/view-link.component').then(
            (m) => m.ViewLinkComponent
          ),
      },
      {
        path: ':suffix/:id',
        loadComponent: () =>
          import('../view-link/view-link.component').then(
            (m) => m.ViewLinkComponent
          ),
      },
    ],
  },
];
