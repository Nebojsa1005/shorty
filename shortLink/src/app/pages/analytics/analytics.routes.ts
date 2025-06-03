import { Routes } from '@angular/router';

export const analyticsRoutes: Routes = [
	{
		path: '',
		loadComponent: () => import('./analytics.component').then(c => c.AnalyticsComponent)
	}
];
