import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import gsap from 'gsap';
import { prefersReducedMotion } from 'src/app/shared/utils/gsap-animations';

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
export class FeaturesComponent implements AfterViewInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>);
  private gsapCtx?: gsap.Context;

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
        'Sub-50ms redirect latency globally. Your audience gets where they\'re going without the wait.',
    },
  ];

  ngAfterViewInit(): void {
    if (prefersReducedMotion()) return;

    this.gsapCtx = gsap.context(() => {
      gsap.from('.section-label, .section-title, .section-sub', {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
        clearProps: 'all',
      });
      gsap.from('.feature-card', {
        opacity: 0,
        y: 28,
        duration: 0.5,
        stagger: 0.07,
        delay: 0.2,
        ease: 'power2.out',
        clearProps: 'all',
      });
    }, this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.gsapCtx?.revert();
  }
}
