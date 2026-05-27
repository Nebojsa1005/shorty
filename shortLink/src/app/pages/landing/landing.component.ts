import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HeroComponent } from './components/hero/hero.component';
import { StatsComponent } from './components/stats/stats.component';
import { FeaturesComponent } from './components/features/features.component';
import { PricingTeaserComponent } from './components/pricing-teaser/pricing-teaser.component';
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
export class LandingComponent implements OnInit, OnDestroy {
  private seo = inject(SeoService);
  private jsonLd = inject(JsonLdService);
  private doc = inject(DOCUMENT);

  ngOnInit(): void {
    this.seo.setPageSeo({
      title: 'Shorty — Create Branded Short Links in Seconds',
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
          name: 'Shorty',
          description: 'URL shortener with analytics, password protection, and custom link management.',
        },
        {
          '@type': 'Organization',
          '@id': `${origin}/#organization`,
          name: 'Shorty',
          url: `${origin}/`,
          logo: `${origin}/assets/logo.png`,
        },
        {
          '@type': 'SoftwareApplication',
          name: 'Shorty',
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
