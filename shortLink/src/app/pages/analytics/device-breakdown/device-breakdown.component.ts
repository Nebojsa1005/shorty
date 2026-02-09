import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective } from 'ngx-echarts';
import { DeviceBreakdown } from 'src/app/shared/types/analytics.interface';

@Component({
  selector: 'app-device-breakdown',
  imports: [CommonModule, NgxEchartsDirective],
  templateUrl: './device-breakdown.component.html',
  styleUrl: './device-breakdown.component.scss',
})
export class DeviceBreakdownComponent {
  breakdown = input<DeviceBreakdown | null>(null);
  loading = input<boolean>(false);

  donutOptions = computed(() => {
    const data = this.breakdown();
    if (!data || data.deviceTypes.length === 0) return null;

    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: '#fff',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        textStyle: { color: '#151419', fontFamily: 'DM Sans', fontSize: 12 },
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        bottom: 0,
        textStyle: { color: '#6B7280', fontFamily: 'DM Sans', fontSize: 12 },
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
        itemGap: 16,
      },
      series: [
        {
          type: 'pie',
          radius: ['50%', '75%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#fff',
            borderWidth: 3,
          },
          label: {
            show: true,
            position: 'center',
            formatter: () => {
              const total = data.deviceTypes.reduce((s, d) => s + d.count, 0);
              return `{total|${total}}\n{label|Total visits}`;
            },
            rich: {
              total: { fontSize: 22, fontWeight: 600, color: '#151419', fontFamily: 'DM Sans', lineHeight: 30 },
              label: { fontSize: 12, color: '#9CA3AF', fontFamily: 'DM Sans', lineHeight: 18 },
            },
          },
          emphasis: {
            label: { show: true },
            itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.1)' },
          },
          data: data.deviceTypes.map((d) => ({
            value: d.count,
            name: d._id,
          })),
          color: ['#9A4EAE', '#392A48', '#D4A5E0', '#B06CC4'],
          animationType: 'scale',
          animationEasing: 'cubicOut' as const,
        },
      ],
    };
  });

  browserOptions = computed(() => {
    const data = this.breakdown();
    if (!data || data.browsers.length === 0) return null;

    const browsers = [...data.browsers].reverse();

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: '#fff',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        textStyle: { color: '#151419', fontFamily: 'DM Sans', fontSize: 12 },
      },
      grid: { left: 80, right: 40, top: 8, bottom: 8, containLabel: false },
      xAxis: {
        type: 'value',
        axisLabel: { color: '#9CA3AF', fontFamily: 'DM Sans', fontSize: 11 },
        splitLine: { lineStyle: { color: '#F3F4F6' } },
        axisTick: { show: false },
        axisLine: { show: false },
      },
      yAxis: {
        type: 'category',
        data: browsers.map((b) => b._id),
        axisLabel: { color: '#151419', fontFamily: 'DM Sans', fontSize: 12 },
        axisTick: { show: false },
        axisLine: { show: false },
      },
      series: [
        {
          type: 'bar',
          data: browsers.map((b) => b.count),
          barWidth: 16,
          itemStyle: {
            borderRadius: [0, 4, 4, 0],
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: '#9A4EAE' },
                { offset: 1, color: '#392A48' },
              ],
            },
          },
          emphasis: { itemStyle: { shadowBlur: 6, shadowColor: 'rgba(154, 78, 174, 0.3)' } },
          animationDelay: (idx: number) => idx * 80,
        },
      ],
      animationEasing: 'cubicOut' as const,
    };
  });

  osOptions = computed(() => {
    const data = this.breakdown();
    if (!data || data.operatingSystems.length === 0) return null;

    const os = [...data.operatingSystems].reverse();

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: '#fff',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        textStyle: { color: '#151419', fontFamily: 'DM Sans', fontSize: 12 },
      },
      grid: { left: 80, right: 40, top: 8, bottom: 8, containLabel: false },
      xAxis: {
        type: 'value',
        axisLabel: { color: '#9CA3AF', fontFamily: 'DM Sans', fontSize: 11 },
        splitLine: { lineStyle: { color: '#F3F4F6' } },
        axisTick: { show: false },
        axisLine: { show: false },
      },
      yAxis: {
        type: 'category',
        data: os.map((o) => o._id),
        axisLabel: { color: '#151419', fontFamily: 'DM Sans', fontSize: 12 },
        axisTick: { show: false },
        axisLine: { show: false },
      },
      series: [
        {
          type: 'bar',
          data: os.map((o) => o.count),
          barWidth: 16,
          itemStyle: {
            borderRadius: [0, 4, 4, 0],
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: '#392A48' },
                { offset: 1, color: '#9A4EAE' },
              ],
            },
          },
          emphasis: { itemStyle: { shadowBlur: 6, shadowColor: 'rgba(57, 42, 72, 0.3)' } },
          animationDelay: (idx: number) => idx * 80,
        },
      ],
      animationEasing: 'cubicOut' as const,
    };
  });

  browserChartHeight = computed(() => {
    const data = this.breakdown();
    if (!data) return '120px';
    return Math.max(120, data.browsers.length * 34) + 'px';
  });

  osChartHeight = computed(() => {
    const data = this.breakdown();
    if (!data) return '120px';
    return Math.max(120, data.operatingSystems.length * 34) + 'px';
  });
}
