import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HeroComponent } from './components/hero/hero.component';
import { StatsComponent } from './components/stats/stats.component';
import { FeaturesComponent } from './components/features/features.component';
import { PricingComponent } from '../pricing/pricing.component';
import { TestimonialsComponent } from './components/testimonials/testimonials.component';
import { FooterComponent } from './components/footer/footer.component';
import { SeoService } from 'src/app/core/services/seo.service';
import { JsonLdService } from 'src/app/core/services/json-ld.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NavbarComponent,
    HeroComponent,
    StatsComponent,
    FeaturesComponent,
    PricingComponent,
    TestimonialsComponent,
    FooterComponent,
  ],
  template: `
    <app-navbar />
    <main>
      <app-hero id="hero" />
      <app-stats id="stats" />
      <app-features id="features" />
      <section class="pricing-section" id="pricing">
        <div class="pricing-section__header">
          <span class="section-label">Pricing</span>
          <h2 class="section-title">Simple, transparent pricing</h2>
          <p class="section-sub">No hidden fees. Cancel any time. Start with a plan that fits your needs.</p>
        </div>
        <app-pricing />
      </section>
      <app-testimonials id="testimonials" />
    </main>
    <app-footer />
  `,
  styles: [`
    main { overflow: hidden; }

    .pricing-section {
      padding: 6rem 1.5rem;
      background: var(--color-app-bg);
    }

    .pricing-section__header {
      max-width: 1120px;
      margin: 0 auto 3rem;
      text-align: center;
    }

    .section-label {
      display: inline-flex;
      align-items: center;
      padding: 0.3rem 0.85rem;
      background: var(--color-primary-tint);
      border: 1px solid rgba(129, 140, 248, 0.2);
      border-radius: var(--radius-pill);
      font-size: var(--text-xs);
      font-weight: var(--font-semibold);
      color: var(--color-primary-light);
      margin-bottom: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-family: var(--font-family);
    }

    .section-title {
      font-size: clamp(1.75rem, 3.5vw, 2.4rem);
      font-weight: var(--font-extrabold);
      letter-spacing: -0.03em;
      color: var(--color-text-primary);
      margin: 0 0 1rem;
      font-family: var(--font-family);
      line-height: 1.15;
    }

    .section-sub {
      font-size: var(--text-base);
      color: var(--color-text-secondary);
      max-width: 480px;
      margin: 0 auto;
      line-height: 1.7;
      font-family: var(--font-family);
    }
  `],
})
export class LandingComponent implements OnInit, OnDestroy {
  private seo = inject(SeoService);
  private jsonLd = inject(JsonLdService);
  private doc = inject(DOCUMENT);

  ngOnInit(): void {
    this.seo.setPageSeo({
      title: 'Minculum — Create Branded Short Links in Seconds',
      description: 'Shorten URLs, track clicks, and analyze your audience. Create custom short links with powerful analytics, password protection, and expiration dates.',
    });

    const origin = this.doc.location.origin;
    this.jsonLd.setSchema({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${origin}/#website`,
          url: `${origin}/`,
          name: 'Minculum',
          description: 'URL shortener with analytics, password protection, and custom link management.',
        },
        {
          '@type': 'Organization',
          '@id': `${origin}/#organization`,
          name: 'Minculum',
          url: `${origin}/`,
          logo: `${origin}/assets/logo.png`,
        },
        {
          '@type': 'SoftwareApplication',
          name: 'Minculum',
          applicationCategory: 'UtilitiesApplication',
          operatingSystem: 'Web',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            description: 'Free plan available. Pro and Ultimate plans for advanced features.',
          },
        },
      ],
    });
  }

  ngOnDestroy(): void {
    this.jsonLd.removeSchema();
  }
}
