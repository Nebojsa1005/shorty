import { Component, computed, effect, input } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { UrlLink } from 'src/app/shared/types/url.interface';
import * as echarts from 'echarts';
import { getLast30Days, getLast7Weekdays } from 'src/app/utils/date.util';

@Component({
  selector: 'app-time-span',
  imports: [NgxEchartsDirective],
  templateUrl: './time-span.component.html',
  styleUrl: './time-span.component.scss',
})
export class TimeSpanComponent {
  allLinks = input<UrlLink[]>([]);
  allLinksLoading = input<boolean>(false);

  last30Days = getLast30Days();

chartData = computed(() => {
    const dataByDay = this.last30Days.map((date) => new Date(date).getTime());

    return this.allLinks().map((link) => {
      const viewMap = new Map<string, number>();
      link.analytics.entries.forEach((entry) => {
        const key = new Date(entry.date).toISOString().split('T')[0];
        viewMap.set(key, (viewMap.get(key) || 0) + entry.viewCount);
      });

      const data = this.last30Days.map((date) => viewMap.get(date) ?? 0);
      console.log(data);
      
      return {
        name: link.urlName,
        type: 'line',
        stack: 'Total',
        data,
      };
    });
  });

  xAxisRange = computed(() => {
    const timestamps = this.chartData().map((entry) =>
      new Date(entry.data[1]).getTime()
    );
    if (!timestamps.length) return { min: undefined, max: undefined };

    const min = Math.min(...timestamps);
    const max = Math.max(...timestamps);

    return { min, max };
  });
  chartOptions = computed(() => {
    const allLinks = this.allLinks();

    return {
      title: {
        text: 'Last 30 Days View Count',
      },
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: this.allLinks().map((link) => link.urlName),
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '5%',
        containLabel: true,
      },
      toolbox: {
        feature: {
          saveAsImage: {},
        },
      },
      dataZoom: [{ type: 'slider' }, { type: 'inside' }],
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: this.last30Days,
        axisLabel: {
          rotate: 45,
        },
      },
      yAxis: {
        type: 'value',
      },
      series: this.chartData(),
    };

    // return {
    //   title: {
    //     text: 'Stacked Line',
    //   },
    //   tooltip: {
    //     trigger: 'axis',
    //   },
    //   legend: {
    //     data: allLinks.map((link) => link.urlName),
    //   },
    //   grid: {
    //     left: '3%',
    //     right: '4%',
    //     bottom: '5%',
    //     containLabel: true,
    //   },
    //   toolbox: {
    //     feature: {
    //       saveAsImage: {},
    //     },
    //   },
    //   dataZoom: [
    //     {
    //       type: 'slider',
    //     },
    //     {
    //       type: 'inside',
    //     },
    //   ],
    //   xAxis: {
    //     type: 'category',
    //     boundaryGap: false,
    //     data: getLast7Weekdays(),
    //   },
    //   yAxis: {
    //     type: 'value',
    //   },
    //   series: this.chartData(),
    // };
  });
}
