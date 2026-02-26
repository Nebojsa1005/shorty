import { Component, computed, input } from '@angular/core';
import { UrlLink } from 'src/app/shared/types/url.interface';
import {
  D3BarChartComponent,
  BarChartItem,
} from 'src/app/shared/components/charts/d3-bar-chart/d3-bar-chart.component';

@Component({
  selector: 'app-best-preforming',
  imports: [D3BarChartComponent],
  templateUrl: './best-preforming.component.html',
  styleUrl: './best-preforming.component.scss',
})
export class BestPreformingComponent {
  allLinks = input<UrlLink[]>([]);
  allLinksLoading = input<boolean>(false);

  readonly gradStart = '#9A4EAE';
  readonly gradEnd = '#392A48';

  chartItems = computed<BarChartItem[]>(() => {
    return [...this.allLinks()]
      .sort((a, b) => (b.analytics?.viewCount ?? 0) - (a.analytics?.viewCount ?? 0))
      .slice(0, 3)
      .reverse() // lowest → highest so highest bar is at top
      .map(link => ({
        name: link.urlName,
        value: link.analytics?.viewCount ?? 0,
      }));
  });

  hasData = computed(() => this.chartItems().some(d => d.value > 0));
}
