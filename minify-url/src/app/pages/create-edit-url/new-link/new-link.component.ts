import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IonicModule } from '@ionic/angular';
import { UrlFormComponent } from '../../../shared/components/url-form/url-form.component';
import { UrlService } from '../../services/url.service';

@Component({
  selector: 'app-new-link',
  templateUrl: './new-link.component.html',
  styleUrls: ['./new-link.component.scss'],
  imports: [IonicModule, UrlFormComponent],
  standalone: true,
})
export class NewLinkComponent {
  private urlService = inject(UrlService);
  private destroyRef = inject(DestroyRef);

  urlForm = this.urlService.urlForm


  onSubmit() {
    this.urlService
      .createNewLink()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  onFormChange(urlForm: any) {
    this.urlService.updateUrlForm(urlForm)
  }
}
