import { Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatError } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs';
import { UrlService } from '../../services/url.service';
import { SecurityOptions } from '../../shared/enums/security-options.enum';
import { UrlLink } from '../../shared/types/url.interface';
import { LinkStatus } from '../../shared/enums/link-status.enum';
import { ToastService } from '../../services/toast-service.service';
import { SeoService } from 'src/app/core/services/seo.service';
@Component({
  selector: 'app-view-link',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatError,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './view-link.component.html',
  styleUrl: './view-link.component.scss',
})
export class ViewLinkComponent implements OnInit {
  showPassword = false;

  private route = inject(ActivatedRoute);
  private urlService = inject(UrlService);
  private toastService = inject(ToastService);
  private seo = inject(SeoService);
  private platformId = inject(PLATFORM_ID);
  SecurityOptions = SecurityOptions;

  linkId = this.route.snapshot.params['id'];
  suffix = this.route.snapshot.params['suffix'];

  shortLink = signal<UrlLink | null>(null);

  expirationDateCheck = computed(() => {
    const shortLink = this.shortLink();

    if (!shortLink) {
      return;
    }

    // Check status field from backend
    if (shortLink.status === LinkStatus.EXPIRED) {
      return false;
    }

    if (!shortLink.userExpirationDate) {
      return true;
    }

    const valid =
      new Date(shortLink.userExpirationDate).getTime() > new Date().getTime();

    if (!valid) {
      return false;
    }
    return true;
  });

  passwordControl = new FormControl('');

  ngOnInit() {
    this.seo.updateMeta({
      title: 'Minculum — Redirecting',
      description: 'You are being redirected via a Minculum short link.',
      noindex: true,
    });

    this.urlService
      .getShortLinkByShortLinkId(this.linkId, this.suffix)
      .pipe(
        tap((res) => {
          this.shortLink.update(() => res?.data);

          const link = res?.data;
          if (link) {
            this.seo.updateMeta({
              title: link.urlName ? `${link.urlName} — Minculum` : 'Minculum — Redirecting',
              description: `Short link created with Minculum. Destination: ${link.destinationUrl}`,
              noindex: true,
            });
          }

          if (!this.expirationDateCheck()) return;

          if (this.shortLink()?.security === SecurityOptions.PASSWORD) {
            this.passwordControl.addValidators(Validators.required);
          } else if (isPlatformBrowser(this.platformId)) {
            window.location.href = res?.data.destinationUrl;
          }
        })
      )
      .subscribe();
  }

  passwordCheck() {
    if (this.passwordControl.valid) {
      this.urlService
        .passwordCheck(
          this.passwordControl.getRawValue() as string,
          this.shortLink()?._id as string,
          this.shortLink()?.destinationUrl as string
        )
        .subscribe();
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
