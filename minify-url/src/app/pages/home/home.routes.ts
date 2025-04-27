import { Routes } from '@angular/router';

export const homeRoutes: Routes = [
    {
        path: '',
        loadComponent: ()=> import('./home.component').then(c => c.HomeComponent)
    }
];
