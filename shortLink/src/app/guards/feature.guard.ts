import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

export const analyticsFeatureGuard = () => {
  if (environment.features.ANALYTICS_ENABLED) return true;
  return inject(Router).createUrlTree(['/coming-soon']);
};
