import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  D3ChoroplethMapComponent,
  ChoroplethCountry,
} from '../d3-choropleth-map.component';
import { ALPHA2_TO_NUMERIC, NUMERIC_TO_NAME } from '../country-lookup';

export interface MapDialogData {
  countries: ChoroplethCountry[];
}

interface CountryRow {
  flag: string;
  name: string;
  clicks: number;
  pct: string;
}

function resolveCountryName(alpha2: string): string {
  const numId = ALPHA2_TO_NUMERIC.get(alpha2.toUpperCase());
  return (numId != null ? NUMERIC_TO_NAME.get(numId) : null) ?? alpha2.toUpperCase();
}

function countryFlag(alpha2: string): string {
  return alpha2
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join('');
}

@Component({
  selector: 'app-map-expand-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    D3ChoroplethMapComponent,
  ],
  templateUrl: './map-expand-dialog.component.html',
  styleUrl: './map-expand-dialog.component.scss',
})
export class MapExpandDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<MapExpandDialogComponent>);
  readonly data = inject<MapDialogData>(MAT_DIALOG_DATA);

  readonly rows = computed<CountryRow[]>(() => {
    const filtered = this.data.countries.filter((c) => c.code !== 'unknown');
    const total = filtered.reduce((sum, c) => sum + c.clicks, 0);
    return [...filtered]
      .sort((a, b) => b.clicks - a.clicks)
      .map((c) => ({
        flag:   countryFlag(c.code),
        name:   resolveCountryName(c.code),
        clicks: c.clicks,
        pct:    total > 0 ? ((c.clicks / total) * 100).toFixed(1) : '0.0',
      }));
  });

  close() {
    this.dialogRef.close();
  }
}
