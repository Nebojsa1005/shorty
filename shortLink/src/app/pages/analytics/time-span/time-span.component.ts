import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  input,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { UrlLink } from 'src/app/shared/types/url.interface';
import {
  get12MonthsAgo,
  get1Month,
  get1MonthAgo,
  get6MonthsAgo,
} from 'src/app/utils/date.util';

@Component({
  selector: 'app-time-span',
  imports: [
    NgApexchartsModule,
    CommonModule,
    MatButton,
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
  @ViewChild('chart', { static: false }) chart!: ChartComponent;

  allLinks = input<UrlLink[]>([]);
  allLinksLoading = input<boolean>(false);

  searchControl = new FormControl('');

  searchControlValueChanges = toSignal(
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    )
  );

  xAxisRangeUpdate = signal(null);

  timeSpanLinkPerformance = computed(() => {
    const allLinks = this.allLinks();
    const searchValue = this.searchControlValueChanges();
  
    return allLinks.filter(link => link.urlName.includes(searchValue ?? '')).slice(0, 5)
  });
  xAxisRange = computed(() => {
    const allLinks = this.allLinks();
    let minEntryDate = 0;
    let maxEntryDate = 0;

    allLinks.forEach((link) => {
      const { analytics } = link;
      const millisecondsEntries = analytics.entries.map((entry) =>
        new Date(entry.date).getTime()
      );
      const minLinkEntry = Math.min(...millisecondsEntries);
      const maxLinkEntry = Math.max(...millisecondsEntries);

      if (minLinkEntry < minEntryDate || minEntryDate === 0) {
        minEntryDate = minLinkEntry - get1Month();
      }

      if (maxLinkEntry > maxEntryDate || maxEntryDate === 0) {
        maxEntryDate = maxLinkEntry + get1Month();
      }
    });

    return { xaxis: { min: minEntryDate, max: maxEntryDate } };
  });

  chartData = computed(() => {
    const charDataArray: any = [];
    this.timeSpanLinkPerformance().forEach((link) => {
      const chartDataEntry = link.analytics.entries.map((entry) => [
        new Date(entry.date).getTime(),
        entry.viewCount,
      ]);
      charDataArray.push({
        name: link.urlName,
        data: chartDataEntry,
      });
    });

    return charDataArray;
  });
  public chartOptions = computed<any>(() => {
    return {
      series: this.chartData(),
      chart: {
        type: 'area',
        height: 350,
      },
      dataLabels: {
        enabled: false,
      },
      markers: {
        size: 0,
      },
      xaxis: {
        type: 'datetime',
        tickAmount: 6,
      },
      tooltip: {
        x: {
          format: 'dd MMM yyyy',
        },
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.9,
          stops: [0, 100],
        },
      },
    };
  });
  public activeOptionButton = '1m';
  public updateOptionsData: any = {
    '1m': {
      xaxis: {
        min: get1MonthAgo(),
        max: new Date().getTime(),
      },
    },
    '6m': {
      xaxis: {
        min: get6MonthsAgo(),
        max: new Date().getTime(),
      },
    },
    '1y': {
      xaxis: {
        min: get12MonthsAgo(),
        max: new Date().getTime(),
      },
    },
    all: {
      xaxis: {
        min: undefined,
        max: undefined,
      },
    },
  };

  constructor() {
    effect(() => {
      const series = this.chartData();
      const chart = this.chart;

      if (chart) {
        chart?.updateSeries(series);
      }
    });

    effect(() => {
      const xAxisRangeUpdate = this.xAxisRangeUpdate();
      const xAxisRange = this.xAxisRange();
      const range = xAxisRangeUpdate ? xAxisRangeUpdate : xAxisRange;

      if (this.chart) {
        this.chart.updateOptions(range, false, true, true);
        this.chart.zoomX(range.xaxis.min, range.xaxis.max);
      }
    });
  }
  public updateOptions(option: string): void {
    this.xAxisRangeUpdate.update((state) => this.updateOptionsData[option]);
  }
}
