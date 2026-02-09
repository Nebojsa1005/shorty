import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective } from 'ngx-echarts';
import { LocationBreakdown } from 'src/app/shared/types/analytics.interface';

@Component({
  selector: 'app-location-breakdown',
  imports: [CommonModule, NgxEchartsDirective],
  templateUrl: './location-breakdown.component.html',
  styleUrl: './location-breakdown.component.scss',
})
export class LocationBreakdownComponent {
  breakdown = input<LocationBreakdown | null>(null);
  loading = input<boolean>(false);

  countryOptions = computed(() => {
    const data = this.breakdown();
    if (!data || data.countries.length === 0) return null;

    const countries = [...data.countries].reverse();
    const purpleShades = ['#9A4EAE', '#392A48', '#D4A5E0', '#B06CC4', '#5C3A6E', '#E8D0F0'];

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: '#fff',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        textStyle: { color: '#151419', fontFamily: 'DM Sans', fontSize: 12 },
      },
      grid: { left: 70, right: 40, top: 8, bottom: 8, containLabel: false },
      xAxis: {
        type: 'value',
        axisLabel: { color: '#9CA3AF', fontFamily: 'DM Sans', fontSize: 11 },
        splitLine: { lineStyle: { color: '#F3F4F6' } },
        axisTick: { show: false },
        axisLine: { show: false },
      },
      yAxis: {
        type: 'category',
        data: countries.map((c) => c._id),
        axisLabel: { color: '#151419', fontFamily: 'DM Sans', fontSize: 12 },
        axisTick: { show: false },
        axisLine: { show: false },
      },
      series: [
        {
          type: 'bar',
          data: countries.map((c, i) => ({
            value: c.count,
            itemStyle: {
              color: purpleShades[i % purpleShades.length],
              borderRadius: [0, 4, 4, 0],
            },
          })),
          barWidth: 18,
          emphasis: { itemStyle: { shadowBlur: 6, shadowColor: 'rgba(154, 78, 174, 0.3)' } },
          animationDelay: (idx: number) => idx * 80,
        },
      ],
      animationEasing: 'cubicOut' as const,
    };
  });

  cityOptions = computed(() => {
    const data = this.breakdown();
    if (!data || data.cities.length === 0) return null;

    const cities = [...data.cities].reverse();

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
        data: cities.map((c) => c._id),
        axisLabel: { color: '#151419', fontFamily: 'DM Sans', fontSize: 12 },
        axisTick: { show: false },
        axisLine: { show: false },
      },
      series: [
        {
          type: 'bar',
          data: cities.map((c) => c.count),
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

  countryChartHeight = computed(() => {
    const data = this.breakdown();
    if (!data) return '140px';
    return Math.max(140, data.countries.length * 34) + 'px';
  });

  cityChartHeight = computed(() => {
    const data = this.breakdown();
    if (!data) return '140px';
    return Math.max(140, data.cities.length * 34) + 'px';
  });
}
