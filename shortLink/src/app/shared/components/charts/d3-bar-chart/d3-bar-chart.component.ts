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

export interface BarChartItem {
  name: string;
  value: number;
  color?: string;
}

const BAR_H = 16;
const BAR_SPACING = 34; // row height per bar
const MARGIN_TOP = 8;
const MARGIN_BOTTOM = 8;
const MARGIN_RIGHT = 48; // space for value labels

@Component({
  selector: 'app-d3-bar-chart',
  standalone: true,
  template: `
    <div style="position: relative; width: 100%;" #container>
      <svg #svgEl style="width: 100%; display: block;"></svg>
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
export class D3BarChartComponent implements OnDestroy {
  @ViewChild('svgEl', { static: true }) svgEl!: ElementRef<SVGSVGElement>;
  @ViewChild('tooltipEl', { static: true }) tooltipEl!: ElementRef<HTMLDivElement>;
  @ViewChild('container', { static: true }) containerEl!: ElementRef<HTMLDivElement>;

  data = input<BarChartItem[]>([]);
  /** px reserved for y-axis labels. Set to 0 for auto (uses ~7px * maxNameLen) */
  labelWidth = input<number>(80);
  gradientStart = input<string>('#9A4EAE');
  gradientEnd = input<string>('#392A48');
  /** When true, use item.color instead of gradient */
  useItemColors = input<boolean>(false);
  /** Tooltip suffix shown after value (e.g. 'clicks') */
  tooltipSuffix = input<string>('');

  private readonly injector = inject(Injector);
  private resizeObserver?: ResizeObserver;
  private resizeTimer?: ReturnType<typeof setTimeout>;
  private readonly componentId = Math.random().toString(36).slice(2, 8);

  constructor() {
    afterNextRender(() => {
      this.setupResizeObserver();
      effect(
        () => {
          this.data();
          this.labelWidth();
          this.gradientStart();
          this.gradientEnd();
          this.useItemColors();
          this.tooltipSuffix();
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
    const lWidth = this.labelWidth();
    const gStart = this.gradientStart();
    const gEnd = this.gradientEnd();
    const useColors = this.useItemColors();
    const suffix = this.tooltipSuffix();

    d3.select(svgEl).selectAll('*').remove();

    if (items.length === 0) {
      d3.select(svgEl).attr('width', 0).attr('height', 0);
      return;
    }

    const totalWidth = container.clientWidth || 400;
    const marginLeft = lWidth;
    const innerWidth = totalWidth - marginLeft - MARGIN_RIGHT;
    const totalHeight = MARGIN_TOP + items.length * BAR_SPACING + MARGIN_BOTTOM;

    const svgSel = d3.select(svgEl).attr('width', totalWidth).attr('height', totalHeight);
    const defs = svgSel.append('defs');

    // Gradient (used when !useItemColors)
    const gradId = `bg-${this.componentId}`;
    const grad = defs
      .append('linearGradient')
      .attr('id', gradId)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');
    grad.append('stop').attr('offset', '0%').attr('stop-color', gStart);
    grad.append('stop').attr('offset', '100%').attr('stop-color', gEnd);

    const maxVal = (d3.max(items, d => d.value) as number) || 1;
    const xScale = d3.scaleLinear().domain([0, maxVal]).range([0, innerWidth]);

    const g = svgSel.append('g').attr('transform', `translate(${marginLeft},${MARGIN_TOP})`);

    // Subtle vertical grid lines
    g.append('g')
      .call(
        d3
          .axisTop(xScale)
          .ticks(4)
          .tickSize(-(totalHeight - MARGIN_TOP - MARGIN_BOTTOM))
          .tickFormat(() => ''),
      )
      .call(sel => sel.select('.domain').remove())
      .call(sel => sel.selectAll('line').attr('stroke', '#F9FAFB').attr('stroke-dasharray', '3,3'));

    items.forEach((item, i) => {
      const y = i * BAR_SPACING;
      const barW = xScale(item.value);
      const fillColor = useColors && item.color ? item.color : `url(#${gradId})`;
      const truncName = item.name.length > 13 ? item.name.slice(0, 13) + '…' : item.name;

      // Y-axis label
      svgSel
        .append('text')
        .attr('x', marginLeft - 10)
        .attr('y', MARGIN_TOP + y + BAR_H / 2 + 4)
        .attr('text-anchor', 'end')
        .attr('fill', '#151419')
        .attr('font-family', "'DM Sans', sans-serif")
        .attr('font-size', '12px')
        .text(truncName);

      // Bar
      const bar = g
        .append('rect')
        .attr('x', 0)
        .attr('y', y + (BAR_SPACING - BAR_H) / 2)
        .attr('width', 0)
        .attr('height', BAR_H)
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('fill', fillColor)
        .style('cursor', 'default');

      bar
        .transition()
        .delay(i * 60)
        .duration(550)
        .ease(d3.easeCubicOut)
        .attr('width', Math.max(barW, 0));

      // Value label (appears after bar animates)
      const valLabel = g
        .append('text')
        .attr('x', barW + 6)
        .attr('y', y + (BAR_SPACING - BAR_H) / 2 + BAR_H / 2 + 4)
        .attr('fill', '#9CA3AF')
        .attr('font-family', "'DM Sans', sans-serif")
        .attr('font-size', '11px')
        .attr('opacity', 0)
        .text(item.value);

      valLabel
        .transition()
        .delay(i * 60 + 550)
        .duration(200)
        .attr('opacity', 1);

      // Invisible hover zone
      g.append('rect')
        .attr('x', 0)
        .attr('y', y)
        .attr('width', innerWidth + MARGIN_RIGHT)
        .attr('height', BAR_SPACING)
        .attr('fill', 'transparent')
        .on('mouseover', () => {
          bar.attr('opacity', 0.8);
        })
        .on('mousemove', (event: MouseEvent) => {
          const label = suffix ? `${item.value} ${suffix}` : String(item.value);
          tooltipEl.innerHTML = `<strong>${item.name}</strong>: ${label}`;
          tooltipEl.style.opacity = '1';
          const rect = container.getBoundingClientRect();
          let tx = event.clientX - rect.left + 14;
          const ttw = tooltipEl.offsetWidth;
          if (tx + ttw > totalWidth) tx = event.clientX - rect.left - ttw - 14;
          tooltipEl.style.left = `${tx}px`;
          tooltipEl.style.top = `${event.clientY - rect.top - 40}px`;
        })
        .on('mouseout', () => {
          bar.attr('opacity', 1);
          tooltipEl.style.opacity = '0';
        });
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    clearTimeout(this.resizeTimer);
  }
}
