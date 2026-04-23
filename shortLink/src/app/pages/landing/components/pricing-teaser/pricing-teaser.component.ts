import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import gsap from 'gsap';
import { prefersReducedMotion } from 'src/app/shared/utils/gsap-animations';

export interface PlanTeaser {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  featured: boolean;
}

@Component({
  selector: 'app-pricing-teaser',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './pricing-teaser.component.html',
  styleUrl: './pricing-teaser.component.scss',
})
export class PricingTeaserComponent implements AfterViewInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>);
  private gsapCtx?: gsap.Context;
  private observer?: IntersectionObserver;

  plans: PlanTeaser[] = [
    {
      name: 'Essential',
      price: '$9',
      period: '/mo',
      description: 'For individuals and small projects.',
      features: ['50 short links', 'Click analytics', 'Custom slugs', 'CSV export'],
      featured: false,
    },
    {
      name: 'Pro',
      price: '$29',
      period: '/mo',
      description: 'For growing teams who need more power.',
      features: ['Unlimited links', 'Advanced analytics', 'Password protection', 'Priority support'],
      featured: true,
    },
    {
      name: 'Ultimate',
      price: '$79',
      period: '/mo',
      description: 'Enterprise-grade for large organizations.',
      features: ['Everything in Pro', 'Dedicated onboarding', 'API access', 'Custom domain'],
      featured: false,
    },
  ];

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          this.observer?.disconnect();
          this.animateIn();
        }
      },
      { threshold: 0.15 }
    );

    const section = this.el.nativeElement.querySelector('.pricing-teaser');
    if (section) this.observer.observe(section);
  }

  private animateIn(): void {
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
      gsap.from('.plan-card', {
        opacity: 0,
        y: 28,
        duration: 0.5,
        stagger: 0.1,
        delay: 0.25,
        ease: 'power2.out',
        clearProps: 'all',
      });
      gsap.from('.pricing-teaser__cta', {
        opacity: 0,
        y: 16,
        duration: 0.4,
        delay: 0.55,
        ease: 'power2.out',
        clearProps: 'all',
      });
    }, this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.gsapCtx?.revert();
  }
}
