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
import { feature } from 'topojson-client';
import type { Topology } from 'topojson-specification';
import { ALPHA2_TO_NUMERIC, NUMERIC_TO_NAME } from './country-lookup';

export interface ChoroplethCountry {
  /** ISO alpha-2 code returned by geoip-lite (e.g. "US", "GB") */
  code: string;
  clicks: number;
}

// Shared TopoJSON cache — fetched once per page load
let worldDataPromise: Promise<Topology> | null = null;
function getWorldTopology(): Promise<Topology> {
  if (!worldDataPromise) {
    worldDataPromise = fetch(
      'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json',
    ).then(r => r.json() as Promise<Topology>);
  }
  return worldDataPromise;
}

const NO_DATA_COLOR = '#F3F4F6';
const OCEAN_COLOR = '#F8FAFC';
const BORDER_COLOR = '#FFFFFF';

@Component({
  selector: 'app-d3-choropleth-map',
  standalone: true,
  template: `
    <div style="position: relative; width: 100%;" #container>
      <!-- Loading skeleton -->
      @if (loading()) {
        <div style="
          width: 100%;
          height: 280px;
          background: linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%);
          background-size: 200% 100%;
          border-radius: 8px;
          animation: shimmer 1.5s infinite;
        "></div>
      }

      <svg #svgEl style="width: 100%; display: block;" [style.display]="loading() ? 'none' : 'block'"></svg>

      <!-- Legend -->
      @if (!loading() && hasData()) {
        <div style="display: flex; align-items: center; gap: 6px; margin-top: 8px; justify-content: flex-end;">
          <span style="font-size: 11px; color: #9CA3AF; font-family: 'DM Sans', sans-serif;">Fewer</span>
          <svg width="120" height="12">
            <defs>
              <linearGradient id="legend-grad-map">
                <stop offset="0%" stop-color="#E9D5FF"/>
                <stop offset="100%" stop-color="#581C87"/>
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="120" height="12" rx="4" fill="url(#legend-grad-map)"/>
          </svg>
          <span style="font-size: 11px; color: #9CA3AF; font-family: 'DM Sans', sans-serif;">More</span>
        </div>
      }

      <!-- Tooltip -->
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
  styles: [`
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class D3ChoroplethMapComponent implements OnDestroy {
  @ViewChild('svgEl', { static: true }) svgEl!: ElementRef<SVGSVGElement>;
  @ViewChild('tooltipEl', { static: true }) tooltipEl!: ElementRef<HTMLDivElement>;
  @ViewChild('container', { static: true }) containerEl!: ElementRef<HTMLDivElement>;

  /** Array of { code: 'US', clicks: 42 } — code is ISO alpha-2 */
  countries = input<ChoroplethCountry[]>([]);
  height = input<number>(280);
  loading = input<boolean>(false);

  private readonly injector = inject(Injector);
  private resizeObserver?: ResizeObserver;
  private resizeTimer?: ReturnType<typeof setTimeout>;
  private topology: Topology | null = null;

  hasData = () => this.countries().length > 0;

  constructor() {
    afterNextRender(() => {
      this.setupResizeObserver();

      // Load world topology once, then set up reactive rendering
      getWorldTopology().then(topo => {
        this.topology = topo;
        this.render();
        effect(
          () => {
            this.countries();
            this.height();
            this.loading();
            if (this.topology) this.render();
          },
          { injector: this.injector },
        );
      });
    });
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(() => {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => this.render(), 120);
    });
    this.resizeObserver.observe(this.containerEl.nativeElement);
  }

  private render(): void {
    if (!this.topology || this.loading()) return;

    const svgEl = this.svgEl.nativeElement;
    const tooltipEl = this.tooltipEl.nativeElement;
    const container = this.containerEl.nativeElement;
    const countriesData = this.countries();
    const h = this.height();

    const totalWidth = container.clientWidth || 600;
    if (totalWidth <= 0) return;

    d3.select(svgEl).selectAll('*').remove();

    // Build a lookup: numeric ISO id → click count
    const clicksByNumericId = new Map<number, number>();
    for (const c of countriesData) {
      const numId = ALPHA2_TO_NUMERIC.get(c.code.toUpperCase());
      if (numId != null) {
        clicksByNumericId.set(numId, (clicksByNumericId.get(numId) ?? 0) + c.clicks);
      }
    }

    const maxClicks = clicksByNumericId.size > 0
      ? (d3.max([...clicksByNumericId.values()]) as number)
      : 0;

    // Color scale: sqrt for better distribution across magnitudes
    const colorScale = d3.scaleSequentialSqrt(d3.interpolate('#E9D5FF', '#581C87'))
      .domain([0, maxClicks || 1]);

    // Convert TopoJSON → GeoJSON
    const topoAny = this.topology as any;
    const geoCountries = feature(this.topology, topoAny.objects.countries);

    // Projection: natural earth, fitted to SVG
    const projection = d3.geoNaturalEarth1().fitSize([totalWidth, h], geoCountries as any);
    const pathGen = d3.geoPath().projection(projection);

    const svgSel = d3.select(svgEl)
      .attr('width', totalWidth)
      .attr('height', h)
      .style('background', OCEAN_COLOR);

    const g = svgSel.append('g');

    // Sphere background (ocean)
    g.append('path')
      .datum({ type: 'Sphere' } as any)
      .attr('d', pathGen as any)
      .attr('fill', OCEAN_COLOR)
      .attr('stroke', 'none');

    // Country fills
    const paths = g
      .selectAll<SVGPathElement, any>('path.country')
      .data((geoCountries as any).features)
      .join('path')
      .attr('class', 'country')
      .attr('d', (d: any) => pathGen(d) ?? '')
      .attr('fill', (d: any) => {
        const count = clicksByNumericId.get(Number(d.id));
        return count != null ? colorScale(count) : NO_DATA_COLOR;
      })
      .attr('stroke', BORDER_COLOR)
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .attr('opacity', 0)
      .transition()
      .duration(600)
      .delay((_: any, i: number) => Math.min(i * 2, 300)) // stagger capped at 300ms
      .attr('opacity', 1);

    // Hover interactions
    g.selectAll<SVGPathElement, any>('path.country')
      .on('mouseover', (event: MouseEvent, d: any) => {
        const numId = Number(d.id);
        const count = clicksByNumericId.get(numId);
        const name = NUMERIC_TO_NAME.get(numId) ?? 'Unknown';

        d3.select(event.currentTarget as SVGPathElement)
          .raise()
          .transition()
          .duration(100)
          .attr('stroke', count != null ? '#6B21A8' : '#D1D5DB')
          .attr('stroke-width', 1.5);

        tooltipEl.innerHTML = count != null
          ? `<strong>${name}</strong><br><span style="color:#9A4EAE;">${count.toLocaleString()} click${count !== 1 ? 's' : ''}</span>`
          : `<strong>${name}</strong><br><span style="color:#9CA3AF;">No data</span>`;
        tooltipEl.style.opacity = '1';
        this.positionTooltip(tooltipEl, event, container, totalWidth);
      })
      .on('mousemove', (event: MouseEvent) => {
        this.positionTooltip(tooltipEl, event, container, totalWidth);
      })
      .on('mouseout', (event: MouseEvent, d: any) => {
        const numId = Number(d.id);
        const count = clicksByNumericId.get(numId);
        d3.select(event.currentTarget as SVGPathElement)
          .transition()
          .duration(100)
          .attr('stroke', BORDER_COLOR)
          .attr('stroke-width', 0.5)
          .attr('fill', count != null ? colorScale(count) : NO_DATA_COLOR);
        tooltipEl.style.opacity = '0';
      });

    // Zoom & pan
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on('zoom', event => {
        g.attr('transform', event.transform);
      });

    d3.select(svgEl).call(zoom);
  }

  private positionTooltip(
    el: HTMLDivElement,
    event: MouseEvent,
    container: HTMLElement,
    totalWidth: number,
  ): void {
    const rect = container.getBoundingClientRect();
    const ttw = el.offsetWidth;
    let tx = event.clientX - rect.left + 14;
    if (tx + ttw > totalWidth) tx = event.clientX - rect.left - ttw - 14;
    el.style.left = `${tx}px`;
    el.style.top = `${event.clientY - rect.top - 44}px`;
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    clearTimeout(this.resizeTimer);
  }
}
