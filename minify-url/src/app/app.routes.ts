import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./pages/home/home.routes').then((r) => r.homeRoutes),
  },
  {
    path: 'add-new-link',
    loadComponent: () =>
      import('./pages/new-link/new-link.component').then(
        (c) => c.NewLinkComponent
      ),
  },
  {
    path: 'edit-link/:id',
    loadComponent: () =>
      import('./pages/edit-link/edit-link.component').then(
        (c) => c.EditLinkComponent
      ),
  },
];
