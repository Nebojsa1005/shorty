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

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

@Component({
  selector: 'app-stats',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss',
})
export class StatsComponent implements AfterViewInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>);
  private gsapCtx?: gsap.Context;
  private observer?: IntersectionObserver;

  stats: Stat[] = [
    { value: 12, suffix: 'M+', label: 'Links shortened' },
    { value: 48, suffix: 'M+', label: 'Clicks tracked' },
    { value: 99.9, suffix: '%', label: 'Uptime SLA' },
    { value: 1200, suffix: '+', label: 'Teams & creators' },
  ];

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          this.observer?.disconnect();
          this.animateIn();
        }
      },
      { threshold: 0.25 }
    );

    const section = this.el.nativeElement.querySelector('.stats');
    if (section) this.observer.observe(section);
  }

  private animateIn(): void {
    const reduced = prefersReducedMotion();

    this.gsapCtx = gsap.context(() => {
      if (!reduced) {
        gsap.from('.stat-item', {
          opacity: 0,
          y: 24,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
          clearProps: 'all',
        });
      }

      this.stats.forEach((stat, i) => {
        const numEl = this.el.nativeElement.querySelectorAll('.stat-item__number')[i];
        if (!numEl) return;

        if (reduced) {
          numEl.textContent = stat.value.toString();
          return;
        }

        const isDecimal = !Number.isInteger(stat.value);
        const counter = { value: 0 };
        gsap.to(counter, {
          value: stat.value,
          duration: 2,
          ease: 'power2.out',
          delay: i * 0.08 + 0.15,
          onUpdate: () => {
            numEl.textContent = isDecimal
              ? parseFloat(counter.value.toFixed(1)).toString()
              : Math.round(counter.value).toString();
          },
        });
      });
    }, this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.gsapCtx?.revert();
  }
}
