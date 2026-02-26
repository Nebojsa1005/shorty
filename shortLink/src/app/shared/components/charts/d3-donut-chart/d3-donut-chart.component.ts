import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  ViewChild,
  afterNextRender,
  effect,
  inject,
  input,
} from '@angular/core';
import * as d3 from 'd3';

export interface DonutChartItem {
  name: string;
  value: number;
}

@Component({
  selector: 'app-d3-donut-chart',
  standalone: true,
  template: `
    <div style="position: relative; width: 100%;" #container>
      <svg #svgEl style="width: 100%; display: block;"></svg>
      <div style="display: flex; flex-wrap: wrap; gap: 4px 16px; margin-top: 8px; justify-content: center;">
        @for (item of data(); track item.name; let i = $index) {
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%;"
                  [style.background]="resolveColor(i)"></span>
            <span style="font-size: 12px; color: #6B7280; font-family: 'DM Sans', sans-serif;">{{ item.name }}</span>
          </div>
        }
      </div>
      <div #tooltipEl style="
        position: absolute;
        top: 0;
        left: 0;
        background: white;
        border: 1px solid #E5E7EB;
        border-radius: 8px;
        padding: 8px 12px;
        font-family: 'DM Sans', sans-serif;
        font-size: 12px;
        color: #151419;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.15s;
        white-space: nowrap;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        z-index: 10;
      "></div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class D3DonutChartComponent implements OnDestroy {
  @ViewChild('svgEl', { static: true }) svgEl!: ElementRef<SVGSVGElement>;
  @ViewChild('tooltipEl', { static: true }) tooltipEl!: ElementRef<HTMLDivElement>;
  @ViewChild('container', { static: true }) containerEl!: ElementRef<HTMLDivElement>;

  data = input<DonutChartItem[]>([]);
  colors = input<string[]>(['#9A4EAE', '#B06CC4', '#D4A5E0', '#392A48']);
  height = input<number>(240);
  centerLabel = input<string>('Total visits');

  private readonly injector = inject(Injector);
  private resizeObserver?: ResizeObserver;
  private resizeTimer?: ReturnType<typeof setTimeout>;

  resolveColor(index: number): string {
    const c = this.colors();
    return c[index % c.length];
  }

  constructor() {
    afterNextRender(() => {
      this.setupResizeObserver();
      effect(
        () => {
          this.data();
          this.colors();
          this.height();
          this.centerLabel();
          this.render();
        },
        { injector: this.injector },
      );
    });
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(() => {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => this.render(), 100);
    });
    this.resizeObserver.observe(this.containerEl.nativeElement);
  }

  private render(): void {
    const svgEl = this.svgEl.nativeElement;
    const tooltipEl = this.tooltipEl.nativeElement;
    const container = this.containerEl.nativeElement;

    const items = this.data();
    const colorPalette = this.colors();
    const h = this.height();
    const label = this.centerLabel();

    d3.select(svgEl).selectAll('*').remove();

    if (items.length === 0) {
      d3.select(svgEl).attr('width', 0).attr('height', 0);
      return;
    }

    const totalWidth = container.clientWidth || 300;
    const cx = totalWidth / 2;
    const cy = h / 2;
    const outerR = Math.min(cx, cy) * 0.78;
    const innerR = outerR * 0.62;
    const total = d3.sum(items, d => d.value);

    const svgSel = d3.select(svgEl).attr('width', totalWidth).attr('height', h);

    const g = svgSel.append('g').attr('transform', `translate(${cx},${cy})`);

    type Datum = d3.PieArcDatum<DonutChartItem>;

    const pie = d3.pie<DonutChartItem>().value(d => d.value).sort(null).padAngle(0.025);

    const arc = d3
      .arc<Datum>()
      .innerRadius(innerR)
      .outerRadius(outerR)
      .cornerRadius(3);

    const arcHover = d3
      .arc<Datum>()
      .innerRadius(innerR)
      .outerRadius(outerR + 9)
      .cornerRadius(3);

    const arcs = pie(items);

    // Render arcs with scale-in animation
    g.selectAll<SVGPathElement, Datum>('path')
      .data(arcs)
      .enter()
      .append('path')
      .attr('fill', (_, i) => colorPalette[i % colorPalette.length])
      .attr('d', d => arc(d) ?? '')
      .style('cursor', 'pointer')
      .attr('transform', 'scale(0.5)')
      .attr('opacity', 0)
      .transition()
      .duration(500)
      .delay((_, i) => i * 80)
      .ease(d3.easeCubicOut)
      .attr('transform', 'scale(1)')
      .attr('opacity', 1);

    // Hover interactions (applied after paint)
    g.selectAll<SVGPathElement, Datum>('path')
      .on('mouseover', (event: MouseEvent, d: Datum) => {
        d3.select(event.currentTarget as SVGPathElement)
          .transition()
          .duration(150)
          .attr('d', arcHover(d) ?? '');

        const pct = total > 0 ? ((d.data.value / total) * 100).toFixed(1) : '0';
        tooltipEl.innerHTML = `<strong>${d.data.name}</strong>: ${d.data.value} (${pct}%)`;
        tooltipEl.style.opacity = '1';
        const rect = container.getBoundingClientRect();
        let tx = event.clientX - rect.left + 14;
        const ttw = tooltipEl.offsetWidth;
        if (tx + ttw > totalWidth) tx = event.clientX - rect.left - ttw - 14;
        tooltipEl.style.left = `${tx}px`;
        tooltipEl.style.top = `${event.clientY - rect.top - 40}px`;
      })
      .on('mousemove', (event: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        let tx = event.clientX - rect.left + 14;
        const ttw = tooltipEl.offsetWidth;
        if (tx + ttw > totalWidth) tx = event.clientX - rect.left - ttw - 14;
        tooltipEl.style.left = `${tx}px`;
        tooltipEl.style.top = `${event.clientY - rect.top - 40}px`;
      })
      .on('mouseout', (event: MouseEvent, d: Datum) => {
        d3.select(event.currentTarget as SVGPathElement)
          .transition()
          .duration(150)
          .attr('d', arc(d) ?? '');
        tooltipEl.style.opacity = '0';
      });

    // Center: total count
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.15em')
      .attr('fill', '#151419')
      .attr('font-family', "'DM Sans', sans-serif")
      .attr('font-size', '22px')
      .attr('font-weight', '600')
      .text(total.toLocaleString());

    // Center: label
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.3em')
      .attr('fill', '#9CA3AF')
      .attr('font-family', "'DM Sans', sans-serif")
      .attr('font-size', '12px')
      .text(label);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    clearTimeout(this.resizeTimer);
  }
}
