import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationBreakdown } from 'src/app/shared/types/analytics.interface';
import {
  D3ChoroplethMapComponent,
  ChoroplethCountry,
} from 'src/app/shared/components/charts/d3-choropleth-map/d3-choropleth-map.component';
import { ALPHA2_TO_NUMERIC, NUMERIC_TO_NAME } from 'src/app/shared/components/charts/d3-choropleth-map/country-lookup';

export interface TopCountry {
  code: string;
  name: string;
  clicks: number;
  pct: number; // 0–100, relative to #1
}

const RANK_COLORS = ['#9A4EAE', '#B06CC4', '#D4A5E0'];

@Component({
  selector: 'app-location-breakdown',
  imports: [CommonModule, D3ChoroplethMapComponent],
  templateUrl: './location-breakdown.component.html',
  styleUrl: './location-breakdown.component.scss',
})
export class LocationBreakdownComponent {
  breakdown = input<LocationBreakdown | null>(null);
  loading = input<boolean>(false);

  readonly rankColors = RANK_COLORS;

  mapCountries = computed<ChoroplethCountry[]>(() => {
    const data = this.breakdown();
    if (!data) return [];
    return data.countries.map(c => ({ code: c._id, clicks: c.count }));
  });

  topCountries = computed<TopCountry[]>(() => {
    const data = this.breakdown();
    if (!data || data.countries.length === 0) return [];

    const sorted = [...data.countries].sort((a, b) => b.count - a.count).slice(0, 3);
    const maxClicks = sorted[0].count || 1;

    return sorted.map(c => {
      const numId = ALPHA2_TO_NUMERIC.get(c._id.toUpperCase());
      const name = (numId != null ? NUMERIC_TO_NAME.get(numId) : null) ?? c._id;
      return {
        code: c._id,
        name,
        clicks: c.count,
        pct: Math.round((c.count / maxClicks) * 100),
      };
    });
  });

  hasCountries = computed(() => (this.breakdown()?.countries.length ?? 0) > 0);
}
