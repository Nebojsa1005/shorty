import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { GoogleChartsModule, ChartType } from 'angular-google-charts';

export interface DonutChartItem {
  name: string;
  value: number;
}

@Component({
  selector: 'app-d3-donut-chart',
  standalone: true,
  imports: [GoogleChartsModule],
  template: `
    <google-chart
      [type]="chartType"
      [data]="chartData()"
      [columns]="chartColumns"
      [options]="chartOptions()"
      style="width: 100%; display: block;"
    ></google-chart>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class D3DonutChartComponent {
  data = input<DonutChartItem[]>([]);
  colors = input<string[]>(['#9A4EAE', '#B06CC4', '#D4A5E0', '#392A48']);
  height = input<number>(240);
  centerLabel = input<string>('Total visits');

  readonly chartType = ChartType.PieChart;
  readonly chartColumns = ['Label', 'Value'];

  chartData = computed<[string, number][]>(() =>
    this.data().map(item => [item.name, item.value]),
  );

  chartOptions = computed(() => ({
    height: this.height(),
    backgroundColor: 'transparent',
    pieHole: 0.4,
    colors: this.colors(),
    legend: { position: 'bottom', textStyle: { color: '#94A3B8', fontName: 'DM Sans', fontSize: 12 } },
    chartArea: { left: 16, right: 16, top: 16, bottom: 40 },
    pieSliceText: 'none',
    tooltip: { textStyle: { fontName: 'DM Sans', fontSize: 12 } },
    fontName: 'DM Sans',
  }));
}
