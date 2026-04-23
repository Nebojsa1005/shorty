import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HeroComponent } from './components/hero/hero.component';
import { StatsComponent } from './components/stats/stats.component';
import { FeaturesComponent } from './components/features/features.component';
import { PricingTeaserComponent } from './components/pricing-teaser/pricing-teaser.component';
import { TestimonialsComponent } from './components/testimonials/testimonials.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NavbarComponent,
    HeroComponent,
    StatsComponent,
    FeaturesComponent,
    PricingTeaserComponent,
    TestimonialsComponent,
    FooterComponent,
  ],
  template: `
    <app-navbar />
    <main>
      <app-hero id="hero" />
      <app-stats id="stats" />
      <app-features id="features" />
      <app-pricing-teaser id="pricing" />
      <app-testimonials id="testimonials" />
    </main>
    <app-footer />
  `,
  styles: [`
    main { overflow: hidden; }
  `],
})
export class LandingComponent {}
