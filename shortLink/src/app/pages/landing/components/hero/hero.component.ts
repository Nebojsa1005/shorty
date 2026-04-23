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

@Component({
  selector: 'app-hero',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>);
  private gsapCtx?: gsap.Context;

  barHeights = [40, 60, 45, 80, 55, 70, 90, 65, 75, 50, 85, 60];

  scrollToFeatures(): void {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  }

  ngAfterViewInit(): void {
    if (prefersReducedMotion()) return;

    this.gsapCtx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out', clearProps: 'all' } });

      tl.from('.hero__badge', { opacity: 0, y: 16, duration: 0.45 })
        .from('.hero__headline', { opacity: 0, y: 20, duration: 0.5 }, '-=0.25')
        .from('.hero__subheading', { opacity: 0, y: 18, duration: 0.45 }, '-=0.25')
        .from('.hero__ctas', { opacity: 0, y: 16, duration: 0.4 }, '-=0.2')
        .from('.hero__social-proof', { opacity: 0, y: 12, duration: 0.35 }, '-=0.15')
        .from('.hero__preview', { opacity: 0, y: 30, duration: 0.6 }, '-=0.4');
    }, this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.gsapCtx?.revert();
  }
}
