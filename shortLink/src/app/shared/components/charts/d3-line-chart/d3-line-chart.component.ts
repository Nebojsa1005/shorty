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

export interface LineChartSeries {
  name: string;
  color: string;
  data: [number, number][]; // [timestamp_ms, value]
}

const MARGIN = { top: 16, right: 16, bottom: 32, left: 48 };

@Component({
  selector: 'app-d3-line-chart',
  standalone: true,
  template: `
    <div style="position: relative; width: 100%;" #container>
      <svg #svgEl style="width: 100%; display: block; overflow: visible;"></svg>
      @if (series().length > 1) {
        <div style="display: flex; flex-wrap: wrap; gap: 4px 16px; margin-top: 8px; justify-content: center;">
          @for (s of series(); track s.name) {
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%;"
                    [style.background]="s.color"></span>
              <span style="font-size: 12px; color: #6B7280; font-family: 'DM Sans', sans-serif;">{{ s.name }}</span>
            </div>
          }
        </div>
      }
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
        transform: translateZ(0);
      "></div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class D3LineChartComponent implements OnDestroy {
  @ViewChild('svgEl', { static: true }) svgEl!: ElementRef<SVGSVGElement>;
  @ViewChild('tooltipEl', { static: true }) tooltipEl!: ElementRef<HTMLDivElement>;
  @ViewChild('container', { static: true }) containerEl!: ElementRef<HTMLDivElement>;

  series = input<LineChartSeries[]>([]);
  height = input<number>(350);
  dateRange = input<{ min?: number; max?: number }>({});

  private readonly injector = inject(Injector);
  private resizeObserver?: ResizeObserver;
  private resizeTimer?: ReturnType<typeof setTimeout>;
  private readonly componentId = Math.random().toString(36).slice(2, 8);

  constructor() {
    afterNextRender(() => {
      this.setupResizeObserver();
      effect(
        () => {
          this.series();
          this.height();
          this.dateRange();
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
    const seriesData = this.series();
    const chartHeight = this.height();
    const range = this.dateRange();

    const totalWidth = container.clientWidth || 600;
    const innerWidth = totalWidth - MARGIN.left - MARGIN.right;
    const innerHeight = chartHeight - MARGIN.top - MARGIN.bottom;

    d3.select(svgEl).selectAll('*').remove();

    const hasData = seriesData.some(s => s.data.length > 0);
    if (!hasData || innerWidth <= 0 || innerHeight <= 0) {
      d3.select(svgEl).attr('width', totalWidth).attr('height', 0);
      return;
    }

    const svgSel = d3.select(svgEl).attr('width', totalWidth).attr('height', chartHeight);
    const defs = svgSel.append('defs');

    // Gradient definitions per series
    seriesData.forEach((s, i) => {
      const id = `ll-${this.componentId}-${i}`;
      const grad = defs
        .append('linearGradient')
        .attr('id', id)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');
      grad.append('stop').attr('offset', '0%').attr('stop-color', s.color).attr('stop-opacity', 0.28);
      grad.append('stop').attr('offset', '100%').attr('stop-color', s.color).attr('stop-opacity', 0.02);
    });

    const g = svgSel.append('g').attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    // Collect all data
    const allTs = seriesData.flatMap(s => s.data.map(d => d[0]));
    const allVals = seriesData.flatMap(s => s.data.map(d => d[1]));
    const tsMin = range.min ?? (d3.min(allTs) as number);
    const tsMax = range.max ?? (d3.max(allTs) as number);
    const safeTsMax = tsMax === tsMin ? tsMax + 86_400_000 : tsMax;

    const xScale = d3
      .scaleTime()
      .domain([new Date(tsMin), new Date(safeTsMax)])
      .range([0, innerWidth]);

    const yMax = (d3.max(allVals) as number) || 1;
    const yScale = d3.scaleLinear().domain([0, yMax * 1.1]).range([innerHeight, 0]).nice();

    // Horizontal grid lines
    g.append('g')
      .call(
        d3
          .axisLeft(yScale)
          .ticks(5)
          .tickSize(-innerWidth)
          .tickFormat(() => ''),
      )
      .call(sel => sel.select('.domain').remove())
      .call(sel => sel.selectAll('line').attr('stroke', '#F3F4F6'));

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(5)
          .tickFormat(d => d3.timeFormat('%b %d')(d as Date)),
      )
      .call(sel => sel.select('.domain').attr('stroke', '#F3F4F6'))
      .call(sel => sel.selectAll('.tick line').remove())
      .call(sel =>
        sel
          .selectAll('.tick text')
          .attr('fill', '#9CA3AF')
          .attr('font-family', "'DM Sans', sans-serif")
          .attr('font-size', '11px'),
      );

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .call(sel => sel.select('.domain').remove())
      .call(sel => sel.selectAll('.tick line').remove())
      .call(sel =>
        sel
          .selectAll('.tick text')
          .attr('fill', '#9CA3AF')
          .attr('font-family', "'DM Sans', sans-serif")
          .attr('font-size', '11px'),
      );

    // Line + area generators
    const lineGen = d3
      .line<[number, number]>()
      .x(d => xScale(new Date(d[0])))
      .y(d => yScale(d[1]))
      .curve(d3.curveCatmullRom.alpha(0.5));

    const areaGen = d3
      .area<[number, number]>()
      .x(d => xScale(new Date(d[0])))
      .y0(innerHeight)
      .y1(d => yScale(d[1]))
      .curve(d3.curveCatmullRom.alpha(0.5));

    // Render each series
    seriesData.forEach((s, i) => {
      const sorted = [...s.data].sort((a, b) => a[0] - b[0]);
      if (sorted.length === 0) return;

      const gradId = `ll-${this.componentId}-${i}`;

      // Area fill
      g.append('path').datum(sorted).attr('fill', `url(#${gradId})`).attr('d', areaGen);

      // Line with draw animation
      const path = g
        .append('path')
        .datum(sorted)
        .attr('fill', 'none')
        .attr('stroke', s.color)
        .attr('stroke-width', 2.5)
        .attr('stroke-linecap', 'round')
        .attr('d', lineGen);

      const node = path.node() as SVGPathElement;
      const len = node.getTotalLength();
      path
        .attr('stroke-dasharray', `${len} ${len}`)
        .attr('stroke-dashoffset', len)
        .transition()
        .duration(900)
        .delay(i * 100)
        .ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0);
    });

    // Tooltip crosshair + overlay
    const bisect = d3.bisector((d: [number, number]) => d[0]).left;

    const crosshair = g
      .append('line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#D1D5DB')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .attr('opacity', 0)
      .attr('pointer-events', 'none');

    // Dot indicators per series
    const dots = seriesData.map((s, i) =>
      g
        .append('circle')
        .attr('r', 4)
        .attr('fill', 'white')
        .attr('stroke', s.color)
        .attr('stroke-width', 2)
        .attr('opacity', 0)
        .attr('pointer-events', 'none'),
    );

    g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mousemove', (event: MouseEvent) => {
        const [mx] = d3.pointer(event);
        const xVal = xScale.invert(mx).getTime();
        crosshair.attr('x1', mx).attr('x2', mx).attr('opacity', 1);

        const rows: string[] = [];
        seriesData.forEach((s, i) => {
          const sorted = [...s.data].sort((a, b) => a[0] - b[0]);
          if (!sorted.length) return;
          const idx = bisect(sorted, xVal, 1);
          const d0 = sorted[Math.max(0, idx - 1)];
          const d1 = sorted[Math.min(sorted.length - 1, idx)];
          const d = Math.abs(d1[0] - xVal) < Math.abs(d0[0] - xVal) ? d1 : d0;
          dots[i].attr('cx', xScale(new Date(d[0]))).attr('cy', yScale(d[1])).attr('opacity', 1);
          rows.push(
            `<div style="display:flex;align-items:center;gap:6px;">` +
              `<span style="width:8px;height:8px;border-radius:50%;background:${s.color};flex-shrink:0;display:inline-block;"></span>` +
              `<span><strong>${s.name}</strong>: ${d[1]}</span>` +
              `</div>`,
          );
        });

        const dateStr = d3.timeFormat('%b %d, %Y')(xScale.invert(mx));
        tooltipEl.innerHTML =
          `<div style="color:#9CA3AF;margin-bottom:6px;font-size:11px;">${dateStr}</div>` + rows.join('');
        tooltipEl.style.opacity = '1';

        const ttw = tooltipEl.offsetWidth;
        let left = MARGIN.left + mx + 14;
        if (left + ttw > totalWidth) left = MARGIN.left + mx - ttw - 14;
        tooltipEl.style.left = `${left}px`;
        tooltipEl.style.top = `${MARGIN.top + 4}px`;
      })
      .on('mouseleave', () => {
        crosshair.attr('opacity', 0);
        dots.forEach(d => d.attr('opacity', 0));
        tooltipEl.style.opacity = '0';
      });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    clearTimeout(this.resizeTimer);
  }
}
