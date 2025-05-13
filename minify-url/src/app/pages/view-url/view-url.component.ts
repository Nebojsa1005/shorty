import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { UrlService } from '../services/url.service';

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

  ngOnInit() {
    const linkId = this.route.snapshot.params['id'];

    alert(12)
    this.urlService
      .getUrlLinkById(linkId)
      .subscribe((res) => {
        window.location.href = res?.data.destinationUrl;
      });
  }


}
