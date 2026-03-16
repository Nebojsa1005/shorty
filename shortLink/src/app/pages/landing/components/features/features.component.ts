import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-features',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './features.component.html',
  styleUrl: './features.component.scss',
})
export class FeaturesComponent {
  features: Feature[] = [
    {
      icon: 'link',
      title: 'Custom short links',
      description:
        'Choose your own slug, set expiry dates, and protect links with a password. Full control in seconds.',
    },
    {
      icon: 'bar-chart',
      title: 'Click analytics',
      description:
        'See every click in real time — broken down by device, browser, country, and referrer.',
    },
    {
      icon: 'map-pin',
      title: 'Geo & device targeting',
      description:
        'Route visitors to different destinations based on their location or device type automatically.',
    },
    {
      icon: 'shield',
      title: 'Password protection',
      description:
        'Add a password to any link to keep private content away from unintended audiences.',
    },
    {
      icon: 'download',
      title: 'Export reports',
      description:
        'Download CSV exports of your analytics data to share with your team or run further analysis.',
    },
    {
      icon: 'zap',
      title: 'Instant redirects',
      description:
        'Sub-50ms redirect latency globally. Your audience gets where theyre going without the wait.',
    },
  ];
}
