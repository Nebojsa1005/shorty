import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import * as echarts from 'echarts/core';
import { provideEchartsCore } from 'ngx-echarts';
import { UrlService } from 'src/app/services/url.service';
import { BestPreformingComponent } from './best-preforming/best-preforming.component';
import { TimeSpanComponent } from './time-span/time-span.component';
import { BarChart, LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, TitleComponent, LegendComponent, ToolboxComponent, DataZoomComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  BarChart,
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
  imports: [RouterModule, CommonModule, BestPreformingComponent, TimeSpanComponent],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss',
  providers: [provideEchartsCore({ echarts })],
})
export class AnalyticsComponent {
  private urlService = inject(UrlService);

  allLinks = computed(() => this.urlService.allUrls())
  bestPreformingLinks = computed(() =>
    this.allLinks().sort((a, b) => {
      const aViews = a.analytics?.viewCount ?? 0;
      const bViews = b.analytics?.viewCount ?? 0;
      return bViews - aViews;
    }).slice(0, 3)
  );
  allLinksLoading = computed(() => this.urlService.allUrlsLoading());

  constructor() {
    this.urlService.fetchAllUrls().pipe(takeUntilDestroyed()).subscribe();
  }
}
