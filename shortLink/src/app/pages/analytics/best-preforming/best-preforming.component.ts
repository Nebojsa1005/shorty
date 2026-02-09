import { Component, computed, input } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { UrlLink } from 'src/app/shared/types/url.interface';

@Component({
  selector: 'app-best-preforming',
  imports: [NgxEchartsDirective],
  templateUrl: './best-preforming.component.html',
  styleUrl: './best-preforming.component.scss',
})
export class BestPreformingComponent {
  allLinks = input<UrlLink[]>([]);
  allLinksLoading = input<boolean>(false);

  chartData = computed(() => {
    const allLinks = this.allLinks();
    return allLinks
      .sort((a, b) => (b.analytics?.viewCount ?? 0) - (a.analytics?.viewCount ?? 0))
      .slice(0, 3)
      .map((link) => ({
        name: link.urlName,
        value: link.analytics?.viewCount ?? 0,
      }));
  });

  chartOptions = computed(() => {
    const data = this.chartData();
    if (data.length === 0) return null;

    return {
      tooltip: {
        trigger: 'axis' as const,
        axisPointer: { type: 'shadow' as const },
        backgroundColor: '#fff',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        textStyle: { color: '#151419', fontFamily: 'DM Sans', fontSize: 12 },
      },
      grid: { left: 16, right: 32, top: 8, bottom: 8, containLabel: true },
      xAxis: {
        type: 'value' as const,
        axisLabel: { color: '#9CA3AF', fontFamily: 'DM Sans', fontSize: 11 },
        splitLine: { lineStyle: { color: '#F3F4F6' } },
        axisTick: { show: false },
        axisLine: { show: false },
      },
      yAxis: {
        type: 'category' as const,
        data: [...data].reverse().map((d) => d.name),
        axisLabel: { color: '#151419', fontFamily: 'DM Sans', fontSize: 12 },
        axisTick: { show: false },
        axisLine: { show: false },
      },
      series: [
        {
          type: 'bar' as const,
          data: [...data].reverse().map((d) => d.value),
          barWidth: 20,
          itemStyle: {
            borderRadius: [0, 6, 6, 0],
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: '#9A4EAE' },
                { offset: 1, color: '#392A48' },
              ],
            },
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 8,
              shadowColor: 'rgba(154, 78, 174, 0.3)',
            },
          },
          label: {
            show: true,
            position: 'right' as const,
            color: '#6B7280',
            fontFamily: 'DM Sans',
            fontSize: 12,
            formatter: '{c}',
          },
          animationDelay: (idx: number) => idx * 100,
        },
      ],
      animationEasing: 'cubicOut' as const,
    };
  });

  chartHeight = computed(() => {
    const data = this.chartData();
    return Math.max(140, data.length * 50) + 'px';
  });
}
