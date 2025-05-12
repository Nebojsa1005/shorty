import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { UrlService } from '../services/url.service';
import { of, switchMap } from 'rxjs';

declare var gtag: Function;

@Component({
  selector: 'app-view-url',
  templateUrl: './view-url.component.html',
  styleUrls: ['./view-url.component.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class ViewUrlComponent {
  private route = inject(ActivatedRoute);
  private urlService = inject(UrlService);

  constructor() {
    const linkId = this.route.snapshot.params['id'];

    gtag("config", "G-2CL6J72DF3", {
      'short_id': linkId,
    })
    setTimeout(() => {
    }, 500)
  }

  ngOnInit() {
    const linkId = this.route.snapshot.params['id'];

    this.urlService
      .getUrlLinkById(linkId)
      .subscribe((res) => {
        window.location.href = res?.data.destinationUrl;
      });
  }

  //Email address: a4-service-account@minify-url-
  // 
  // 458417.iam.gserviceaccount.com 

}
