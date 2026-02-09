import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsOverview } from 'src/app/shared/types/analytics.interface';

@Component({
  selector: 'app-overview-cards',
  imports: [CommonModule],
  templateUrl: './overview-cards.component.html',
  styleUrl: './overview-cards.component.scss',
})
export class OverviewCardsComponent {
  overview = input<AnalyticsOverview | null>(null);
  loading = input<boolean>(false);
}
