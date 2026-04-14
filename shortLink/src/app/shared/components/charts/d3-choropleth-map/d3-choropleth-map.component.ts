import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  OnDestroy,
  signal,
} from '@angular/core';
import { GoogleChartsModule, ChartType } from 'angular-google-charts';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface ChoroplethCountry {
  /** ISO alpha-2 code returned by geoip-lite (e.g. "US", "GB") */
  code: string;
  clicks: number;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 1.4;

@Component({
  selector: 'app-d3-choropleth-map',
  standalone: true,
  imports: [GoogleChartsModule, MatIconModule],
  template: `
    @if (loading()) {
      <div [style.height.px]="height()" style="
        width: 100%;
        background: linear-gradient(90deg, #1E293B 25%, #243044 50%, #1E293B 75%);
        background-size: 200% 100%;
        border-radius: 8px;
        animation: shimmer 1.5s infinite;
      "></div>
    } @else {
      <div
        style="position: relative; overflow: hidden; border-radius: 8px;"
        [style.height.px]="height()"
        [style.cursor]="dragCursor()"
        (mousedown)="onMouseDown($event)"
        (mousemove)="onMouseMove($event)"
        (mouseup)="onPointerUp()"
        (mouseleave)="onPointerUp()"
        (click)="onContainerClick()"
        (touchstart)="onTouchStart($event)"
        (touchend)="onTouchEnd()"
      >
        <!-- Zoomable/pannable inner layer -->
        <div
          style="transform-origin: 0 0;"
          [style.transform]="transformStyle()"
          [style.transition]="isDragging() ? 'none' : 'transform 0.15s ease-out'"
        >
          <google-chart
            [type]="chartType"
            [data]="chartData()"
            [columns]="chartColumns"
            [options]="chartOptions()"
            style="width: 100%; display: block;"
          ></google-chart>
        </div>

        <!-- Expand button (top-right) — hidden inside the modal -->
        @if (canExpand()) {
          <button
            style="position: absolute; top: 6px; right: 6px; z-index: 10; width: 28px; height: 28px;
              border-radius: 6px; background: #243044; border: 1px solid #334155;
              cursor: pointer; display: flex; align-items: center; justify-content: center;
              box-shadow: 0 1px 3px rgba(0,0,0,0.4);"
            (click)="openExpandModal($event)"
            title="Expand map"
          >
            <mat-icon style="font-size: 16px; width: 16px; height: 16px; line-height: 16px; color: #94A3B8;">
              open_in_full
            </mat-icon>
          </button>
        }

        <!-- Zoom controls (bottom-right) -->
        <div style="position: absolute; bottom: 8px; right: 6px; z-index: 10; display: flex; flex-direction: column; gap: 4px;">
          <button
            style="width: 28px; height: 28px; border-radius: 6px; background: #243044; border: 1px solid #334155;
              cursor: pointer; font-size: 18px; line-height: 1; display: flex; align-items: center;
              justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.4); color: #F1F5F9;"
            (click)="zoomIn($event)"
            title="Zoom in"
          >+</button>
          @if (zoom() > 1) {
            <button
              style="width: 28px; height: 28px; border-radius: 6px; background: #243044; border: 1px solid #334155;
                cursor: pointer; font-size: 13px; display: flex; align-items: center;
                justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.4); color: #F1F5F9;"
              (click)="resetZoom($event)"
              title="Reset zoom"
            >↺</button>
          }
          <button
            style="width: 28px; height: 28px; border-radius: 6px; background: #243044; border: 1px solid #334155;
              cursor: pointer; font-size: 22px; line-height: 1; display: flex; align-items: center;
              justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.4); color: #F1F5F9;"
            (click)="zoomOut($event)"
            title="Zoom out"
          >−</button>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class D3ChoroplethMapComponent implements AfterViewInit, OnDestroy {
  countries = input<ChoroplethCountry[]>([]);
  height    = input<number>(280);
  loading   = input<boolean>(false);
  canExpand = input<boolean>(true);

  private readonly dialog = inject(MatDialog);
  private readonly el     = inject(ElementRef);

  readonly chartType    = ChartType.GeoChart;
  readonly chartColumns = ['Country', 'Visits'];

  // ── Zoom / pan state ────────────────────────────────────────────────────────
  zoom = signal(MIN_ZOOM);
  tx   = signal(0);
  ty   = signal(0);
  isDragging = signal(false);

  private _dragging  = false;
  private dragOrigin = { x: 0, y: 0, tx: 0, ty: 0 };
  private hasDragged = false;

  // ── Touch pinch state ───────────────────────────────────────────────────────
  private lastPinchDist = 0;

  // ── Non-passive native listeners ────────────────────────────────────────────
  private readonly wheelHandler     = (e: WheelEvent)  => this.onWheel(e);
  private readonly touchMoveHandler = (e: TouchEvent)  => this.onTouchMove(e);

  // ── Computed ─────────────────────────────────────────────────────────────────
  dragCursor = computed(() => {
    if (this.isDragging()) return 'grabbing';
    return this.zoom() > 1 ? 'grab' : (this.canExpand() ? 'pointer' : 'default');
  });

  transformStyle = computed(() => {
    const z = this.zoom(), x = this.tx(), y = this.ty();
    return z === 1 && x === 0 && y === 0
      ? 'none'
      : `translate(${x}px, ${y}px) scale(${z})`;
  });

  chartData = computed<[string, number][]>(() =>
    this.countries().map(c => [c.code, c.clicks])
  );

  chartOptions = computed(() => ({
    height: this.height(),
    displayMode: 'regions',
    colorAxis: { colors: ['#818CF8', '#6366F1', '#4F46E5'] },
    backgroundColor: '#1E293B',
    datalessRegionColor: '#243044',
    defaultColor: '#243044',
    tooltip: { textStyle: { fontName: 'DM Sans', fontSize: 12 } },
    enableInteractivity: false,
  }));

  // ── Lifecycle ────────────────────────────────────────────────────────────────
  ngAfterViewInit() {
    const host = this.el.nativeElement as HTMLElement;
    host.addEventListener('wheel',     this.wheelHandler,     { passive: false });
    host.addEventListener('touchmove', this.touchMoveHandler, { passive: false });
  }

  ngOnDestroy() {
    const host = this.el.nativeElement as HTMLElement;
    host.removeEventListener('wheel',     this.wheelHandler);
    host.removeEventListener('touchmove', this.touchMoveHandler);
  }

  // ── Wheel zoom ───────────────────────────────────────────────────────────────
  private onWheel(e: WheelEvent) {
    if (this.loading()) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = (this.el.nativeElement as HTMLElement).getBoundingClientRect();
    this.applyZoom(
      e.deltaY < 0 ? 1.15 : 1 / 1.15,
      e.clientX - rect.left,
      e.clientY - rect.top,
      rect.width,
      rect.height,
    );
  }

  // ── Mouse drag ───────────────────────────────────────────────────────────────
  onMouseDown(e: MouseEvent) {
    if (e.button !== 0) return;
    this._dragging  = true;
    this.isDragging.set(true);
    this.hasDragged = false;
    this.dragOrigin = { x: e.clientX, y: e.clientY, tx: this.tx(), ty: this.ty() };
  }

  onMouseMove(e: MouseEvent) {
    if (!this._dragging) return;
    const dx = e.clientX - this.dragOrigin.x;
    const dy = e.clientY - this.dragOrigin.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) this.hasDragged = true;
    if (this.zoom() <= 1) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const { tx, ty } = this.clamp(
      this.zoom(),
      this.dragOrigin.tx + dx,
      this.dragOrigin.ty + dy,
      rect.width,
      rect.height,
    );
    this.tx.set(tx);
    this.ty.set(ty);
  }

  onPointerUp() {
    this._dragging = false;
    this.isDragging.set(false);
  }

  onContainerClick() {
    if (this.hasDragged) return;
    if (this.canExpand()) this.openModal();
  }

  // ── Touch pinch zoom ─────────────────────────────────────────────────────────
  onTouchStart(e: TouchEvent) {
    if (e.touches.length === 2) {
      this.lastPinchDist = this.pinchDist(e);
      this.hasDragged    = true; // prevent tap-to-expand while pinching
    }
  }

  private onTouchMove(e: TouchEvent) {
    if (e.touches.length !== 2) return;
    e.preventDefault();
    const dist   = this.pinchDist(e);
    const factor = dist / this.lastPinchDist;
    const rect   = (this.el.nativeElement as HTMLElement).getBoundingClientRect();
    const cx     = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
    const cy     = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
    this.applyZoom(factor, cx, cy, rect.width, rect.height);
    this.lastPinchDist = dist;
  }

  onTouchEnd() { /* intentionally empty */ }

  // ── Zoom button handlers ─────────────────────────────────────────────────────
  zoomIn(e: MouseEvent)    { e.stopPropagation(); this.zoomFromCenter(ZOOM_STEP);       }
  zoomOut(e: MouseEvent)   { e.stopPropagation(); this.zoomFromCenter(1 / ZOOM_STEP);   }
  resetZoom(e: MouseEvent) {
    e.stopPropagation();
    this.zoom.set(MIN_ZOOM);
    this.tx.set(0);
    this.ty.set(0);
  }

  openExpandModal(e?: MouseEvent) {
    e?.stopPropagation();
    this.openModal();
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────
  private zoomFromCenter(factor: number) {
    const rect = (this.el.nativeElement as HTMLElement).getBoundingClientRect();
    this.applyZoom(factor, rect.width / 2, rect.height / 2, rect.width, rect.height);
  }

  private applyZoom(factor: number, cx: number, cy: number, w: number, h: number) {
    const oldZ = this.zoom();
    const newZ = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, oldZ * factor));
    if (Math.abs(newZ - oldZ) < 0.001) return;
    const { tx, ty } = this.clamp(
      newZ,
      cx - (cx - this.tx()) * newZ / oldZ,
      cy - (cy - this.ty()) * newZ / oldZ,
      w,
      h,
    );
    this.zoom.set(newZ);
    this.tx.set(tx);
    this.ty.set(ty);
  }

  /** Keep the scaled map inside the visible container bounds. */
  private clamp(z: number, tx: number, ty: number, w: number, h: number) {
    return {
      tx: Math.min(0, Math.max(w * (1 - z), tx)),
      ty: Math.min(0, Math.max(h * (1 - z), ty)),
    };
  }

  private pinchDist(e: TouchEvent): number {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private async openModal() {
    const { MapExpandDialogComponent } = await import(
      './map-expand-dialog/map-expand-dialog.component'
    );
    this.dialog.open(MapExpandDialogComponent, {
      data:      { countries: this.countries() },
      width:     '90vw',
      maxWidth:  '960px',
      maxHeight: '90vh',
      autoFocus: false,
    });
  }
}
