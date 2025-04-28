import { Component, DestroyRef, inject, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { urlValidator } from '../../shared/validators/url-validator.validator';
import {
  CreateNewLinkPayload,
  NewLinkService,
} from './services/new-link.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-new-link',
  templateUrl: './new-link.component.html',
  styleUrls: ['./new-link.component.scss'],
  imports: [IonicModule, ReactiveFormsModule],
  standalone: true,
})
export class NewLinkComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private newLinkService = inject(NewLinkService);
  private destroyRef = inject(DestroyRef);

  formGroup = this.fb.group({
    destinationUrl: ['', [Validators.required, urlValidator()]],
    urlName: ['', [Validators.required]],
  });

  get destinationUrlError() {
    if (this.formGroup.get('destinationUrl')?.hasError('required')) {
      return 'This Field is Required';
    } else {
      return 'Must be a valid URL';
    }
  }
  
  get controls() {
    return this.formGroup.controls;
  }

  onSubmit() {
    this.newLinkService
      .createNewLink(this.formGroup.getRawValue() as CreateNewLinkPayload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  ngOnDestroy(): void {
    this.formGroup.reset();
  }
}
