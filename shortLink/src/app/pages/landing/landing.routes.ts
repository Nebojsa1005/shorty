import { Routes } from '@angular/router';

export const landingRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./landing.component').then((c) => c.LandingComponent),
  },
];
