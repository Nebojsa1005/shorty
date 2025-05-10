import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideIonicAngular } from '@ionic/angular/standalone';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideOAuthClient } from 'angular-oauth2-oidc';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideIonicAngular({mode: 'md'}),
    provideHttpClient(),
    provideOAuthClient(),
  ],
};
