import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import * as echarts from 'echarts/core';
import { provideEchartsCore } from 'ngx-echarts';
import { UrlService } from 'src/app/services/url.service';
import { AnalyticsDataService } from 'src/app/services/analytics-data.service';
import { AuthService } from 'src/app/services/auth.service';
import { PlanFeaturesService } from 'src/app/services/plan-features.service';
import { BestPreformingComponent } from './best-preforming/best-preforming.component';
import { TimeSpanComponent } from './time-span/time-span.component';
import { OverviewCardsComponent } from './overview-cards/overview-cards.component';
import { TopLinksComponent } from './top-links/top-links.component';
import { DeviceBreakdownComponent } from './device-breakdown/device-breakdown.component';
import { LocationBreakdownComponent } from './location-breakdown/location-breakdown.component';
import { UpgradePromptComponent } from 'src/app/shared/components/upgrade-prompt/upgrade-prompt.component';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, TitleComponent, LegendComponent, ToolboxComponent, DataZoomComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { environment } from 'src/environments/environment';

echarts.use([
  BarChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  CanvasRenderer,
  LineChart,
  LegendComponent,
  ToolboxComponent,
  DataZoomComponent
]);


@Component({
  selector: 'app-analytics',
  imports: [
    RouterModule,
    CommonModule,
    BestPreformingComponent,
    TimeSpanComponent,
    OverviewCardsComponent,
    TopLinksComponent,
    DeviceBreakdownComponent,
    LocationBreakdownComponent,
    UpgradePromptComponent,
  ],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss',
  providers: [provideEchartsCore({ echarts })],
})
export class AnalyticsComponent {
  private urlService = inject(UrlService);
  private analyticsDataService = inject(AnalyticsDataService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private planFeaturesService = inject(PlanFeaturesService);

  allLinks = computed(() => this.urlService.allUrls());
  bestPreformingLinks = computed(() =>
    this.allLinks().sort((a, b) => {
      const aViews = a.analytics?.viewCount ?? 0;
      const bViews = b.analytics?.viewCount ?? 0;
      return bViews - aViews;
    }).slice(0, 3)
  );
  allLinksLoading = computed(() => this.urlService.allUrlsLoading());

  overview = computed(() => this.analyticsDataService.overview());
  topLinks = computed(() => this.analyticsDataService.topLinks());
  deviceBreakdown = computed(() => this.analyticsDataService.deviceBreakdown());
  locationBreakdown = computed(() => this.analyticsDataService.locationBreakdown());
  analyticsLoading = computed(() => this.analyticsDataService.loading());

  // Plan feature gates
  canViewAdvancedAnalytics = computed(() => this.planFeaturesService.canViewAdvancedAnalytics());
  canExportAnalytics       = computed(() => this.planFeaturesService.canExportAnalytics());
  topLinksCount            = computed(() => this.planFeaturesService.topLinksCount());

  constructor() {
    this.urlService.fetchAllUrls().pipe(takeUntilDestroyed()).subscribe();
    this.analyticsDataService.fetchAll().pipe(takeUntilDestroyed()).subscribe();
  }

  onPeriodChange(period: string) {
    this.analyticsDataService.fetchTopLinks(period).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  exportAnalytics() {
    const userId = this.authService.user()?._id;
    if (!userId) return;
    window.open(`${environment.apiUrl}/api/analytics/export/${userId}`, '_blank');
  }
}
