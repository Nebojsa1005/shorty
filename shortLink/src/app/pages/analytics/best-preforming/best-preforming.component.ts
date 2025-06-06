import { Component, computed, input } from '@angular/core';
import { EChartsCoreOption } from 'echarts/core';
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

  chartOptions = computed<EChartsCoreOption>(() => {
    console.log(this.allLinks());

    return {
      title: {
        text: 'Best Preforming Links',
      },
      tooltip: {
        trigger: 'axis',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: this.allLinks().map((link) => link.urlName),
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: 'Visits',
          type: 'bar',
          data: this.allLinks().map((link) => link.analytics.viewCount),
          smooth: true,
          itemStyle: {
            color: '#3a61f6',
          },
        },
      ],
    };
  });
}
