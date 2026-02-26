import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeviceBreakdown } from 'src/app/shared/types/analytics.interface';
import {
  D3DonutChartComponent,
  DonutChartItem,
} from 'src/app/shared/components/charts/d3-donut-chart/d3-donut-chart.component';
import {
  D3BarChartComponent,
  BarChartItem,
} from 'src/app/shared/components/charts/d3-bar-chart/d3-bar-chart.component';

@Component({
  selector: 'app-device-breakdown',
  imports: [CommonModule, D3DonutChartComponent, D3BarChartComponent],
  templateUrl: './device-breakdown.component.html',
  styleUrl: './device-breakdown.component.scss',
})
export class DeviceBreakdownComponent {
  breakdown = input<DeviceBreakdown | null>(null);
  loading = input<boolean>(false);

  readonly donutColors = ['#9A4EAE', '#B06CC4', '#D4A5E0', '#392A48'];
  readonly browserGradStart = '#9A4EAE';
  readonly browserGradEnd = '#392A48';
  readonly osGradStart = '#392A48';
  readonly osGradEnd = '#9A4EAE';

  deviceItems = computed<DonutChartItem[]>(() => {
    const data = this.breakdown();
    if (!data) return [];
    return data.deviceTypes.map(d => ({ name: d._id, value: d.count }));
  });

  browserItems = computed<BarChartItem[]>(() => {
    const data = this.breakdown();
    if (!data) return [];
    return [...data.browsers]
      .sort((a, b) => a.count - b.count)
      .map(b => ({ name: b._id, value: b.count }));
  });

  osItems = computed<BarChartItem[]>(() => {
    const data = this.breakdown();
    if (!data) return [];
    return [...data.operatingSystems]
      .sort((a, b) => a.count - b.count)
      .map(o => ({ name: o._id, value: o.count }));
  });
}
