import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./pages/home/home.routes').then((r) => r.homeRoutes),
  },
  {
    path: 'url',
    loadChildren: () => import('./pages/create-edit-url/create-edit-url.routes').then(m => m.routes)
  },
];
