import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import * as echarts from 'echarts/core';
import { provideEchartsCore } from 'ngx-echarts';
import { UrlService } from 'src/app/services/url.service';
import { AnalyticsDataService } from 'src/app/services/analytics-data.service';
import { BestPreformingComponent } from './best-preforming/best-preforming.component';
import { TimeSpanComponent } from './time-span/time-span.component';
import { OverviewCardsComponent } from './overview-cards/overview-cards.component';
import { TopLinksComponent } from './top-links/top-links.component';
import { DeviceBreakdownComponent } from './device-breakdown/device-breakdown.component';
import { LocationBreakdownComponent } from './location-breakdown/location-breakdown.component';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, TitleComponent, LegendComponent, ToolboxComponent, DataZoomComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

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
  ],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss',
  providers: [provideEchartsCore({ echarts })],
})
export class AnalyticsComponent {
  private urlService = inject(UrlService);
  private analyticsDataService = inject(AnalyticsDataService);
  private destroyRef = inject(DestroyRef);

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

  constructor() {
    this.urlService.fetchAllUrls().pipe(takeUntilDestroyed()).subscribe();
    this.analyticsDataService.fetchAll().pipe(takeUntilDestroyed()).subscribe();
  }

  onPeriodChange(period: string) {
    this.analyticsDataService.fetchTopLinks(period).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }
}
