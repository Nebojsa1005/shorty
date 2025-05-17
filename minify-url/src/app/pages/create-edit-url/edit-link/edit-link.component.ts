import { Component, DestroyRef, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { UrlFormComponent } from '../../../shared/components/url-form/url-form.component';
import { UrlLink } from '../../../shared/types/url.interface';
import { UrlService } from '../../../services/url.service';

@Component({
  selector: 'app-edit-link',
  templateUrl: './edit-link.component.html',
  styleUrls: ['./edit-link.component.scss'],
  standalone: true,
  imports: [IonicModule, UrlFormComponent]
})
export class EditLinkComponent {
  private urlService = inject(UrlService);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute)

  urlForm = this.urlService.urlForm

  id = this.route.snapshot.params['id']
  suffix = this.route.snapshot.params['suffix']
  existingUrlLink?: UrlLink


  constructor() {
    this.urlService.getShortLinkById(this.id).pipe(
      takeUntilDestroyed()  
    ).subscribe(e => this.existingUrlLink = e?.data)
  }

  onSubmit() {
    this.urlService
      .editLink(this.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  onFormChange(urlForm: any) {
    this.urlService.updateUrlForm(urlForm)
  }
}
