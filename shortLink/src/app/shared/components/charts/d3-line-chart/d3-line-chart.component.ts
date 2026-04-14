import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { GoogleChartsModule, ChartType } from 'angular-google-charts';

export interface LineChartSeries {
  name: string;
  color: string;
  data: [number, number][]; // [timestamp_ms, value]
}

@Component({
  selector: 'app-d3-line-chart',
  standalone: true,
  imports: [GoogleChartsModule],
  template: `
    <google-chart
      [type]="chartType"
      [data]="chartData()"
      [columns]="chartColumns()"
      [options]="chartOptions()"
      style="width: 100%; display: block;"
    ></google-chart>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class D3LineChartComponent {
  series = input<LineChartSeries[]>([]);
  height = input<number>(350);
  dateRange = input<{ min?: number; max?: number }>({});

  readonly chartType = ChartType.AreaChart;

  chartColumns = computed<(string | object)[]>(() => {
    const s = this.series();
    return ['Date', ...s.map(series => series.name)];
  });

  chartData = computed<(Date | number)[][]>(() => {
    const s = this.series();
    if (s.length === 0) return [];

    // Collect all unique timestamps
    const allTimestamps = [...new Set(s.flatMap(series => series.data.map(d => d[0])))].sort(
      (a, b) => a - b,
    );

    // Build a lookup per series
    const lookups = s.map(series => new Map(series.data.map(d => [d[0], d[1]])));

    return allTimestamps.map(ts => {
      const row: (Date | number)[] = [new Date(ts)];
      lookups.forEach(lookup => row.push(lookup.get(ts) ?? 0));
      return row;
    });
  });

  chartOptions = computed(() => {
    const s = this.series();
    const h = this.height();
    return {
      height: h,
      backgroundColor: 'transparent',
      interpolateNulls: true,
      curveType: 'function',
      areaOpacity: 0.15,
      colors: s.map(series => series.color),
      legend: s.length > 1 ? { position: 'bottom', textStyle: { color: '#94A3B8', fontName: 'DM Sans', fontSize: 12 } } : { position: 'none' },
      chartArea: { left: 56, right: 16, top: 16, bottom: 40 },
      hAxis: {
        textStyle: { color: '#94A3B8', fontName: 'DM Sans', fontSize: 11 },
        gridlines: { color: 'transparent' },
        baselineColor: '#334155',
      },
      vAxis: {
        textStyle: { color: '#94A3B8', fontName: 'DM Sans', fontSize: 11 },
        gridlines: { color: '#334155' },
        baselineColor: '#334155',
        minValue: 0,
      },
      tooltip: { textStyle: { fontName: 'DM Sans', fontSize: 12 } },
      fontName: 'DM Sans',
    };
  });
}
