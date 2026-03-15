import { Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { analyticsFeatureGuard } from 'src/app/guards/feature.guard';

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
        path: 'all-links',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('../all-links/all-links.component').then(
            (m) => m.AllLinksComponent
          ),
      },
      {
        path: 'analytics',
        canActivate: [analyticsFeatureGuard], // FEATURE FLAG: FeatureGuard
        loadChildren: () =>
          import('../analytics/analytics.routes').then(
            (r) => r.analyticsRoutes
          ),
      },
      {
        path: 'coming-soon',
        loadComponent: () =>
          import('../coming-soon/coming-soon.component').then(
            (c) => c.ComingSoonComponent
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('../profile/profile.component').then(
            (r) => r.ProfileComponent
          ),
      },
      {
        path: 'pricing',
        loadComponent: () =>
          import('../pricing/pricing.component').then(
            (c) => c.PricingComponent
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
