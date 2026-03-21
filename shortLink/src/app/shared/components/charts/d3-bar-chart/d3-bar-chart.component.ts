import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { GoogleChartsModule, ChartType } from 'angular-google-charts';

export interface BarChartItem {
  name: string;
  value: number;
  color?: string;
}

@Component({
  selector: 'app-d3-bar-chart',
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
export class D3BarChartComponent {
  data = input<BarChartItem[]>([]);
  labelWidth = input<number>(80);
  gradientStart = input<string>('#9A4EAE');
  gradientEnd = input<string>('#392A48');
  useItemColors = input<boolean>(false);
  tooltipSuffix = input<string>('');

  readonly chartType = ChartType.BarChart;
  readonly chartColumns = ['Label', 'Value'];

  chartData = computed<[string, number][]>(() =>
    this.data().map(item => [item.name, item.value]),
  );

  chartOptions = computed(() => {
    const items = this.data();
    const useColors = this.useItemColors();
    const suffix = this.tooltipSuffix();
    const barHeight = 20;
    const rowHeight = 34;
    const height = Math.max(items.length * rowHeight + 40, 80);

    const colors = useColors && items.every(i => i.color)
      ? items.map(i => i.color!)
      : [this.gradientStart()];

    return {
      height,
      legend: { position: 'none' },
      colors,
      chartArea: { left: this.labelWidth(), right: 56, top: 8, bottom: 8 },
      hAxis: {
        textStyle: { color: '#9CA3AF', fontName: 'DM Sans', fontSize: 11 },
        gridlines: { color: '#F9FAFB' },
        baselineColor: 'transparent',
        minValue: 0,
      },
      vAxis: {
        textStyle: { color: '#151419', fontName: 'DM Sans', fontSize: 12 },
      },
      bar: { groupWidth: barHeight },
      tooltip: {
        textStyle: { fontName: 'DM Sans', fontSize: 12 },
        ...(suffix ? { trigger: 'focus' } : {}),
      },
      fontName: 'DM Sans',
    };
  });
}
