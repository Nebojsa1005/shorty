import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  inject,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import gsap from 'gsap';
import { prefersReducedMotion } from 'src/app/shared/utils/gsap-animations';

@Component({
  selector: 'app-upgrade-prompt',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './upgrade-prompt.component.html',
  styleUrl: './upgrade-prompt.component.scss',
})
export class UpgradePromptComponent implements AfterViewInit, OnDestroy {
  @Input() featureName: string = 'This feature';
  @Input() message: string = 'Upgrade your plan to unlock this feature.';

  private el = inject(ElementRef<HTMLElement>);
  private gsapCtx?: gsap.Context;

  readonly barCount = Array.from({ length: 8 });

  ngAfterViewInit(): void {
    if (prefersReducedMotion()) return;

    this.gsapCtx = gsap.context(() => {
      gsap.from('.upgrade-prompt__content', {
        opacity: 0,
        y: 14,
        duration: 0.4,
        ease: 'power2.out',
        clearProps: 'all',
      });
    }, this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.gsapCtx?.revert();
  }
}
