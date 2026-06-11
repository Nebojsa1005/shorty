import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  OnInit,
  output,
} from '@angular/core';
import { LinkFormComponent } from './link-form/link-form.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UrlService } from '../../services/url.service';
import { ToastService } from '../../services/toast-service.service';
import { MatButton } from '@angular/material/button';
import { UrlLink } from '../../shared/types/url.interface';
import { take } from 'rxjs';

@Component({
  selector: 'app-create-edit-link',
  imports: [LinkFormComponent, MatButton],
  templateUrl: './create-edit-link.component.html',
  styleUrl: './create-edit-link.component.scss',
})
export class CreateEditLinkComponent {
  private urlService = inject(UrlService);
  private toastService = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  formSubmittedEvent = output<boolean>()

  urlForm = this.urlService.urlForm;
  canCreateLink = computed(() => this.urlService.canCreateLink());
  id?: string;
  isEdit?: boolean;
  existingLink?: UrlLink;

  idToEdit = computed(() => this.urlService.idToEdit());

  planNotice = computed((): { message: string; warning: boolean } | null => {
    if (this.isEdit) return null;
    const user = this.urlService.user();
    const hasSubscription = !!user?.subscription?.subscriptionId;
    const hasLinks = this.urlService.allUrls().length > 0;
    if (!hasSubscription && !hasLinks) {
      return { message: 'You can create your first link for free! Try it out before subscribing.', warning: false };
    }
    if (!this.canCreateLink()) {
      return { message: 'You have no available links. Please upgrade your plan.', warning: true };
    }
    return null;
  });

  constructor() {
    effect(() => {
      const idToEdit = this.idToEdit();
      this.isEdit = !!idToEdit;

      if (this.isEdit) {
        this.id = idToEdit as string
        this.urlService
          .getShortLinkById(this.id)
          .pipe(take(1))
          .subscribe((e) => (this.existingLink = e?.data));
      }
    });
  }

  onSubmit() {
    if (this.isEdit) {
      this.urlService
        .editLink(this.id as string)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
    } else {
      this.urlService
        .createNewLink()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
    }

    this.formSubmittedEvent.emit(true)

  }

  onFormChange(urlForm: any) {
    this.urlService.updateUrlForm(urlForm);
  }
}
