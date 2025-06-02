import { Component, inject, signal } from '@angular/core';
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
import { ToastService } from '../../services/toast-service.service';
import { AnalyticsService } from 'src/app/services/analytics.service';

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
        ReactiveFormsModule
    ],
    templateUrl: './view-link.component.html',
    styleUrl: './view-link.component.scss'
})
export class ViewLinkComponent {
  showPassword = false;

  private route = inject(ActivatedRoute);
  private urlService = inject(UrlService);
  private toastService = inject(ToastService);
  private analyticsService = inject(AnalyticsService)

  SecurityOptions = SecurityOptions;

  linkId = this.route.snapshot.params['id'];
  suffix = this.route.snapshot.params['suffix'];

  shortLink = signal<UrlLink | null>(null);

  passwordControl = new FormControl('');

  ngOnInit() {
    this.analyticsService.trackEvent('view link loaded', 'link viewed', 'viewLink')
    this.urlService
      .getShortLinkByShortLinkId(this.linkId, this.suffix)
      .pipe(
        tap((res) => {
          this.shortLink.update(() => res?.data);

          if (!this.expirationDateCheck()) return;

          if (this.shortLink()?.security === SecurityOptions.PASSWORD) {
            this.passwordControl.addValidators(Validators.required);
          } else {
            window.location.href = res?.data.destinationUrl;
          }
        })
      )
      .subscribe();
  }

  expirationDateCheck() {
    const shortLink = this.shortLink();

    if (!shortLink) {
      return;
    }

    if (!shortLink.expirationDate) {
      return true;
    }

    const valid =
      new Date(shortLink.expirationDate).getTime() > new Date().getTime();

    if (!valid) {
      this.toastService.presentToast({
        position: 'top',
        message: 'Short Link Expired',
        duration: 5000,
        color: 'danger',
      });
      return false;
    }
    return true;
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
