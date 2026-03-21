import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { GoogleChartsModule, ChartType } from 'angular-google-charts';

export interface ChoroplethCountry {
  /** ISO alpha-2 code returned by geoip-lite (e.g. "US", "GB") */
  code: string;
  clicks: number;
}

@Component({
  selector: 'app-d3-choropleth-map',
  standalone: true,
  imports: [GoogleChartsModule],
  template: `
    @if (loading()) {
      <div style="
        width: 100%;
        height: 280px;
        background: linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%);
        background-size: 200% 100%;
        border-radius: 8px;
        animation: shimmer 1.5s infinite;
      "></div>
    } @else {
      <google-chart
        [type]="chartType"
        [data]="chartData()"
        [columns]="chartColumns"
        [options]="chartOptions()"
        style="width: 100%; display: block;"
      ></google-chart>
    }
  `,
  styles: [`
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class D3ChoroplethMapComponent {
  countries = input<ChoroplethCountry[]>([]);
  height = input<number>(280);
  loading = input<boolean>(false);

  readonly chartType = ChartType.GeoChart;
  readonly chartColumns = ['Country', 'Visits'];

  chartData = computed<[string, number][]>(() =>
    this.countries().map(c => [c.code, c.clicks]),
  );

  chartOptions = computed(() => ({
    height: this.height(),
    displayMode: 'regions',
    colorAxis: { colors: ['#E9D5FF', '#9A4EAE', '#581C87'] },
    backgroundColor: '#F8FAFC',
    datalessRegionColor: '#F3F4F6',
    defaultColor: '#F3F4F6',
    tooltip: { textStyle: { fontName: 'DM Sans', fontSize: 12 } },
  }));
}
