import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { NgxEchartsDirective } from 'ngx-echarts';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { UrlLink } from 'src/app/shared/types/url.interface';
import {
  get1MonthAgo,
  get6MonthsAgo,
  get12MonthsAgo,
} from 'src/app/utils/date.util';

const SERIES_COLORS = ['#9A4EAE', '#392A48', '#D4A5E0', '#B06CC4', '#5C3A6E'];

@Component({
  selector: 'app-time-span',
  imports: [
    NgxEchartsDirective,
    CommonModule,
    MatInput,
    MatFormField,
    MatLabel,
    MatIcon,
    ReactiveFormsModule,
  ],
  templateUrl: './time-span.component.html',
  styleUrl: './time-span.component.scss',
})
export class TimeSpanComponent {
  allLinks = input<UrlLink[]>([]);
  allLinksLoading = input<boolean>(false);

  searchControl = new FormControl('');

  searchControlValueChanges = toSignal(
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    )
  );

  activeOptionButton = signal<string>('1m');

  timeSpanLinkPerformance = computed(() => {
    const allLinks = this.allLinks();
    const searchValue = this.searchControlValueChanges();
    return allLinks
      .filter((link) => link.urlName.includes(searchValue ?? ''))
      .slice(0, 5);
  });

  xAxisRange = computed<{ min: number | undefined; max: number | undefined }>(() => {
    const option = this.activeOptionButton();
    const now = new Date().getTime();

    switch (option) {
      case '1m':
        return { min: get1MonthAgo(), max: now };
      case '6m':
        return { min: get6MonthsAgo(), max: now };
      case '1y':
        return { min: get12MonthsAgo(), max: now };
      default:
        return { min: undefined, max: undefined };
    }
  });

  chartOptions = computed(() => {
    const links = this.timeSpanLinkPerformance();
    const range = this.xAxisRange();

    if (links.length === 0) return null;

    const series = links.map((link, i) => {
      const entries = link.analytics.entries
        .map((entry) => [new Date(entry.date).getTime(), entry.viewCount] as [number, number])
        .sort((a, b) => a[0] - b[0]);

      return {
        name: link.urlName,
        type: 'line' as const,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        showSymbol: false,
        lineStyle: { width: 2.5 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: SERIES_COLORS[i % SERIES_COLORS.length] + '40' },
              { offset: 1, color: SERIES_COLORS[i % SERIES_COLORS.length] + '05' },
            ],
          },
        },
        emphasis: { focus: 'series' as const },
        data: entries,
      };
    });

    return {
      color: SERIES_COLORS,
      tooltip: {
        trigger: 'axis' as const,
        backgroundColor: '#fff',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        textStyle: { color: '#151419', fontFamily: 'DM Sans', fontSize: 12 },
        axisPointer: { type: 'cross' as const, lineStyle: { color: '#E5E7EB' } },
      },
      legend: {
        bottom: 0,
        textStyle: { color: '#6B7280', fontFamily: 'DM Sans', fontSize: 12 },
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
        itemGap: 16,
      },
      grid: { left: 16, right: 16, top: 16, bottom: 40, containLabel: true },
      xAxis: {
        type: 'time' as const,
        min: range.min,
        max: range.max,
        axisLabel: { color: '#9CA3AF', fontFamily: 'DM Sans', fontSize: 11 },
        splitLine: { show: false },
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#F3F4F6' } },
      },
      yAxis: {
        type: 'value' as const,
        axisLabel: { color: '#9CA3AF', fontFamily: 'DM Sans', fontSize: 11 },
        splitLine: { lineStyle: { color: '#F3F4F6' } },
        axisTick: { show: false },
        axisLine: { show: false },
      },
      series,
      animationEasing: 'cubicOut' as const,
    };
  });

  updateOptions(option: string): void {
    this.activeOptionButton.set(option);
  }
}
