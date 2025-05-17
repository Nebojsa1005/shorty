import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { UrlService } from '../../services/url.service';
import { SecurityOptions } from '../../shared/enums/security-options.enum';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { tap } from 'rxjs';
import { UrlLink } from '../../shared/types/url.interface';
import { CommonModule } from '@angular/common';
import { ToastServiceService } from '../../services/toast-service.service';

@Component({
  selector: 'app-view-url',
  templateUrl: './view-url.component.html',
  styleUrls: ['./view-url.component.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule],
})
export class ViewUrlComponent {
  private route = inject(ActivatedRoute);
  private urlService = inject(UrlService);
  private toastService = inject(ToastServiceService);

  SecurityOptions = SecurityOptions;

  linkId = this.route.snapshot.params['id'];
  suffix = this.route.snapshot.params['suffix'];

  shortLink = signal<UrlLink | null>(null);

  passwordControl = new FormControl('');

  ngOnInit() {
    this.urlService
      .getShortLinkByShortLinkId(this.linkId, this.suffix)
      .pipe(
        tap((res) => {
          this.shortLink.update(() => res?.data);

          if (!this.expirationDateCheck()) return 
          
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
}
