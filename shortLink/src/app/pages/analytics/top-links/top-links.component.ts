import { Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TopLink } from 'src/app/shared/types/analytics.interface';
import { UpgradePromptComponent } from 'src/app/shared/components/upgrade-prompt/upgrade-prompt.component';

@Component({
  selector: 'app-top-links',
  imports: [CommonModule, RouterModule, UpgradePromptComponent],
  templateUrl: './top-links.component.html',
  styleUrl: './top-links.component.scss',
})
export class TopLinksComponent {
  topLinks     = input<TopLink[]>([]);
  loading      = input<boolean>(false);
  planLinksCount = input<number>(50);
  periodChange = output<string>();

  activePeriod = signal<string>('all');
  periods = ['day', 'week', 'month', 'all'] as const;

  displayedLinks = computed(() => {
    const count = this.planLinksCount();
    if (count === 0) return [];
    return this.topLinks().slice(0, count);
  });

  selectPeriod(period: string) {
    this.activePeriod.set(period);
    this.periodChange.emit(period);
  }

  maxVisitCount(): number {
    const links = this.displayedLinks();
    if (links.length === 0) return 1;
    return links[0].visitCount || 1;
  }
}
