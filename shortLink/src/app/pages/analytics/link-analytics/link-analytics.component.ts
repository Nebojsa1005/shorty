import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { CopyClipboardDirective } from 'src/app/directives/copy-clipboard.directive';
import { AnalyticsDataService } from 'src/app/services/analytics-data.service';
import { LinkAnalyticsData } from 'src/app/shared/types/analytics.interface';
import {
  D3LineChartComponent,
  LineChartSeries,
} from 'src/app/shared/components/charts/d3-line-chart/d3-line-chart.component';
import {
  D3BarChartComponent,
  BarChartItem,
} from 'src/app/shared/components/charts/d3-bar-chart/d3-bar-chart.component';
import {
  D3DonutChartComponent,
  DonutChartItem,
} from 'src/app/shared/components/charts/d3-donut-chart/d3-donut-chart.component';
import {
  D3ChoroplethMapComponent,
  ChoroplethCountry,
} from 'src/app/shared/components/charts/d3-choropleth-map/d3-choropleth-map.component';

@Component({
  selector: 'app-link-analytics',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    CopyClipboardDirective,
    D3LineChartComponent,
    D3BarChartComponent,
    D3DonutChartComponent,
    D3ChoroplethMapComponent,
  ],
  templateUrl: './link-analytics.component.html',
})
export class LinkAnalyticsComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private analyticsService = inject(AnalyticsDataService);
  private destroyRef = inject(DestroyRef);

  loading = signal(true);
  data = signal<LinkAnalyticsData | null>(null);

  readonly donutColors = ['#9A4EAE', '#B06CC4', '#D4A5E0', '#392A48'];

  entrySeries = computed<LineChartSeries[]>(() => {
    const d = this.data();
    if (!d || d.entries.length === 0) return [];
    return [
      {
        name: 'Views',
        color: '#9A4EAE',
        data: d.entries.map(
          (e) => [new Date(e.date).getTime(), e.viewCount] as [number, number]
        ),
      },
    ];
  });

  countryItems = computed<BarChartItem[]>(() => {
    const d = this.data();
    if (!d) return [];
    return [...d.countries]
      .filter((c) => c._id !== 'unknown')
      .sort((a, b) => a.count - b.count)
      .map((c) => ({ name: c._id, value: c.count }));
  });

  mapCountries = computed<ChoroplethCountry[]>(() => {
    const d = this.data();
    if (!d) return [];
    return d.countries
      .filter((c) => c._id !== 'unknown')
      .map((c) => ({ code: c._id, clicks: c.count }));
  });

  deviceItems = computed<DonutChartItem[]>(() => {
    const d = this.data();
    if (!d) return [];
    return d.deviceTypes.map((dt) => ({ name: dt._id, value: dt.count }));
  });

  browserItems = computed<BarChartItem[]>(() => {
    const d = this.data();
    if (!d) return [];
    return [...d.browsers]
      .sort((a, b) => a.count - b.count)
      .map((b) => ({ name: b._id, value: b.count }));
  });

  constructor() {
    const linkId = this.route.snapshot.queryParamMap.get('linkId');
    if (!linkId) {
      this.router.navigate(['analytics']);
      return;
    }

    this.analyticsService
      .fetchLinkAnalytics(linkId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.data.set(res?.data ?? null);
        this.loading.set(false);
      });
  }

  private tooltipTimers = new WeakMap<MatTooltip, any>();

  onCopy(tooltip: MatTooltip) {
    try {
      tooltip.message = 'Copied!';
      tooltip.show();
      const existing = this.tooltipTimers.get(tooltip);
      if (existing) clearTimeout(existing);
      const t = setTimeout(() => {
        try { tooltip.hide(); tooltip.message = 'Copy'; } catch (e) {}
        this.tooltipTimers.delete(tooltip);
      }, 1200);
      this.tooltipTimers.set(tooltip, t);
    } catch (e) {}
  }

  goBack() {
    this.router.navigate(['all-links']);
  }
}
