import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { LinkFormComponent } from './link-form/link-form.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UrlService } from '../../services/url.service';
import { MatButton } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';
import { UrlLink } from '../../shared/types/url.interface';

@Component({
  selector: 'app-create-edit-link',
  standalone: true,
  imports: [LinkFormComponent, MatButton],
  templateUrl: './create-edit-link.component.html',
  styleUrl: './create-edit-link.component.scss',
})
export class CreateEditLinkComponent {
  private urlService = inject(UrlService);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);

  urlForm = this.urlService.urlForm;
  id = this.route.snapshot.params['id'];
  isEdit = !!this.id;
  existingLink?: UrlLink

  constructor() {
    if (this.isEdit) {
      this.urlService
        .getShortLinkById(this.id)
        .pipe(takeUntilDestroyed())
        .subscribe((e) => this.existingLink = e?.data);
    }
  }

  onSubmit() {
    this.urlService
      .createNewLink()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  onFormChange(urlForm: any) {
    this.urlService.updateUrlForm(urlForm);
  }
}
