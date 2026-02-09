import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopLink } from 'src/app/shared/types/analytics.interface';

@Component({
  selector: 'app-top-links',
  imports: [CommonModule],
  templateUrl: './top-links.component.html',
  styleUrl: './top-links.component.scss',
})
export class TopLinksComponent {
  topLinks = input<TopLink[]>([]);
  loading = input<boolean>(false);
  periodChange = output<string>();

  activePeriod = signal<string>('all');
  periods = ['day', 'week', 'month', 'all'] as const;

  selectPeriod(period: string) {
    this.activePeriod.set(period);
    this.periodChange.emit(period);
  }

  maxVisitCount(): number {
    const links = this.topLinks();
    if (links.length === 0) return 1;
    return links[0].visitCount || 1;
  }
}
