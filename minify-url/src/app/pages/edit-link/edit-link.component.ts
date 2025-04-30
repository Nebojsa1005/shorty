import { Component, DestroyRef, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { UrlFormComponent } from '../../shared/components/url-form/url-form.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UrlService } from '../services/url.service';
import { ActivatedRoute } from '@angular/router';
import { UrlLink } from '../../types/url.interface';

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
  existingUrlLink?: UrlLink


  constructor() {
    this.urlService.getUrlLinkById(this.id).pipe(
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
