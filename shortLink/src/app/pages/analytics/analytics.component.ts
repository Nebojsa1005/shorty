import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import * as echarts from 'echarts/core';
import { provideEchartsCore } from 'ngx-echarts';
import { UrlService } from 'src/app/services/url.service';
import { BestPreformingComponent } from './best-preforming/best-preforming.component';

@Component({
  selector: 'app-analytics',
  imports: [RouterModule, CommonModule, BestPreformingComponent],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss',
  providers: [provideEchartsCore({ echarts })],
})
export class AnalyticsComponent {
  private urlService = inject(UrlService);

  bestPreformingLinks = computed(() =>
    this.urlService.allUrls().sort((a, b) => {
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
