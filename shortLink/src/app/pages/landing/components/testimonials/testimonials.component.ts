import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  inject,
} from '@angular/core';
import gsap from 'gsap';
import { prefersReducedMotion } from 'src/app/shared/utils/gsap-animations';

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
  initials: string;
  color: string;
}

@Component({
  selector: 'app-testimonials',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.scss',
})
export class TestimonialsComponent implements AfterViewInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>);
  private gsapCtx?: gsap.Context;

  testimonials: Testimonial[] = [
    {
      quote:
        'minculum replaced three different tools we were using. The analytics alone are worth it — seeing click data by country in real time is a game changer for our campaigns.',
      name: 'Sarah Chen',
      role: 'Head of Growth',
      company: 'Launchpad HQ',
      initials: 'SC',
      color: '#9a4eae',
    },
    {
      quote:
        'I love how fast and clean it is. No clutter, no confusing settings. I set up a link, share it, and the dashboard tells me everything I need to know.',
      name: 'Marcus Webb',
      role: 'Indie Creator',
      company: 'Self-employed',
      initials: 'MW',
      color: '#6366f1',
    },
    {
      quote:
        'Password-protected links are a must for our team sharing internal docs. minculum handles it perfectly, and the expiry dates give us peace of mind.',
      name: 'Priya Nair',
      role: 'Engineering Manager',
      company: 'Stackbloom',
      initials: 'PN',
      color: '#0891b2',
    },
  ];

  ngAfterViewInit(): void {
    if (prefersReducedMotion()) return;

    this.gsapCtx = gsap.context(() => {
      gsap.from('.section-label, .section-title', {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
        clearProps: 'all',
      });
      gsap.from('.testimonial-card', {
        opacity: 0,
        y: 28,
        duration: 0.5,
        stagger: 0.1,
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
