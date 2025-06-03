import { Component, computed, input } from '@angular/core';
import { EChartsCoreOption } from 'echarts/core';
import { UrlLink } from 'src/app/shared/types/url.interface';
import { BarChart, LineChart } from 'echarts/charts';
import {
  GridComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { NgxEchartsDirective } from 'ngx-echarts';

echarts.use([
  BarChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  CanvasRenderer,
]);

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
        text: 'All Time Visits',
      },
      tooltip: {
        trigger: 'axis',
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
