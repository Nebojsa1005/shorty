import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, forkJoin, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Response } from '../shared/types/response.type';
import {
  AnalyticsOverview,
  TopLink,
  DeviceBreakdown,
  LocationBreakdown,
} from '../shared/types/analytics.interface';
import { AuthService } from './auth.service';

interface AnalyticsDataState {
  overview: AnalyticsOverview | null;
  topLinks: TopLink[];
  deviceBreakdown: DeviceBreakdown | null;
  locationBreakdown: LocationBreakdown | null;
  loading: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsDataService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private state = signal<AnalyticsDataState>({
    overview: null,
    topLinks: [],
    deviceBreakdown: null,
    locationBreakdown: null,
    loading: false,
  });

  overview = computed(() => this.state().overview);
  topLinks = computed(() => this.state().topLinks);
  deviceBreakdown = computed(() => this.state().deviceBreakdown);
  locationBreakdown = computed(() => this.state().locationBreakdown);
  loading = computed(() => this.state().loading);

  private get userId(): string {
    return this.authService.user()?._id || '';
  }

  fetchOverview() {
    return this.http
      .get<Response>(
        `${environment.apiUrl}/api/analytics/overview/${this.userId}`
      )
      .pipe(
        tap((res) =>
          this.state.update((s) => ({ ...s, overview: res.data }))
        ),
        catchError(() => of(null))
      );
  }

  fetchTopLinks(period: string = 'all') {
    return this.http
      .get<Response>(
        `${environment.apiUrl}/api/analytics/top-links/${this.userId}`,
        { params: { period } }
      )
      .pipe(
        tap((res) =>
          this.state.update((s) => ({ ...s, topLinks: res.data }))
        ),
        catchError(() => of(null))
      );
  }

  fetchDeviceBreakdown() {
    return this.http
      .get<Response>(
        `${environment.apiUrl}/api/analytics/device-breakdown/${this.userId}`
      )
      .pipe(
        tap((res) =>
          this.state.update((s) => ({ ...s, deviceBreakdown: res.data }))
        ),
        catchError(() => of(null))
      );
  }

  fetchLocationBreakdown() {
    return this.http
      .get<Response>(
        `${environment.apiUrl}/api/analytics/location-breakdown/${this.userId}`
      )
      .pipe(
        tap((res) =>
          this.state.update((s) => ({ ...s, locationBreakdown: res.data }))
        ),
        catchError(() => of(null))
      );
  }

  fetchAll() {
    this.state.update((s) => ({ ...s, loading: true }));
    return forkJoin([
      this.fetchOverview(),
      this.fetchTopLinks(),
      this.fetchDeviceBreakdown(),
      this.fetchLocationBreakdown(),
    ]).pipe(
      tap(() => this.state.update((s) => ({ ...s, loading: false }))),
      catchError(() => {
        this.state.update((s) => ({ ...s, loading: false }));
        return of(null);
      })
    );
  }
}
