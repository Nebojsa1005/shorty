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
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { UrlLink } from 'src/app/shared/types/url.interface';
import {
  get1MonthAgo,
  get6MonthsAgo,
  get12MonthsAgo,
} from 'src/app/utils/date.util';
import {
  D3LineChartComponent,
  LineChartSeries,
} from 'src/app/shared/components/charts/d3-line-chart/d3-line-chart.component';

const SERIES_COLORS = ['#9A4EAE', '#392A48', '#D4A5E0', '#B06CC4', '#5C3A6E'];

@Component({
  selector: 'app-time-span',
  imports: [
    D3LineChartComponent,
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

  lineSeries = computed<LineChartSeries[]>(() => {
    const links = this.timeSpanLinkPerformance();
    return links.map((link, i) => ({
      name: link.urlName,
      color: SERIES_COLORS[i % SERIES_COLORS.length],
      data: link.analytics.entries
        .map(entry => [new Date(entry.date).getTime(), entry.viewCount] as [number, number])
        .sort((a, b) => a[0] - b[0]),
    }));
  });

  hasData = computed(() => this.lineSeries().some(s => s.data.length > 0));

  updateOptions(option: string): void {
    this.activeOptionButton.set(option);
  }
}
