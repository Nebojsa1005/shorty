import { Component, computed, effect, input, ViewChild } from '@angular/core';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { UrlLink } from 'src/app/shared/types/url.interface';

@Component({
  selector: 'app-best-preforming',
  imports: [NgApexchartsModule],
  templateUrl: './best-preforming.component.html',
  styleUrl: './best-preforming.component.scss',
})
export class BestPreformingComponent {
  @ViewChild('chart') chart!: ChartComponent;

  allLinks = input<UrlLink[]>([]);
  allLinksLoading = input<boolean>(false);

  chartData = computed(() => {
    const allLinks = this.allLinks();
    const topPreforming = allLinks
      .sort((a, b) => a.analytics.viewCount + b.analytics.viewCount)
      .slice(0, 3)
      .map((link) => ({
        data: [link.analytics.viewCount],
        name: link.urlName,
      }));

    return topPreforming;
  });

  public chartOptions = computed<any>(() => {
    const chartData = this.chartData()    
    console.log(chartData);
    
    return {
      series: [
        {
          name: "View Count",
          data: chartData.map(data => data.data[0])
        }
      ],
      chart: {
        height: 350,
        type: "bar"
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: 2
      },
      xaxis: {
        categories: chartData.map(data => data.name),
        tickPlacement: "on"
      },
      yaxis: {
        title: {
          text: "Servings"
        }
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          type: "horizontal",
          shadeIntensity: 0.25,
          gradientToColors: undefined,
          inverseColors: true,
          opacityFrom: 0.85,
          opacityTo: 0.85,
          stops: [50, 0, 100]
        }
      }
    }
  });

  constructor() {
    effect(() => {
      const chartOptions = this.chartOptions();
      const chart = this.chart;

      if (chart) {
        chart.updateOptions(chartOptions);
      }
    });

    effect(() => {
      const chartData = this.chartData()
      const chart = this.chart

      if (chart) {
        this.chart.updateSeries(chartData)
      }
    })
  }
}
