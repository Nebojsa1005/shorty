import { Routes } from '@angular/router';

export const analyticsRoutes: Routes = [
	{
		path: '',
		loadComponent: () => import('./analytics.component').then(c => c.AnalyticsComponent)
	},
	{
		path: 'link',
		loadComponent: () =>
			import('./link-analytics/link-analytics.component').then(
				(c) => c.LinkAnalyticsComponent
			),
	},
];
