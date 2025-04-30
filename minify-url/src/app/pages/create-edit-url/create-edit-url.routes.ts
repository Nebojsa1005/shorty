import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'new',
    pathMatch: 'full'
  },
  {
    path: 'new',
    loadComponent: () => import('./new-link/new-link.component').then(c => c.NewLinkComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./edit-link/edit-link.component').then(c => c.EditLinkComponent)
  }
];
