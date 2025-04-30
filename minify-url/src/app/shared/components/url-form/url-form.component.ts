import { Component, DestroyRef, effect, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { tap } from 'rxjs';
import { urlValidator } from '../../validators/url-validator.validator';
import { UrlLink } from '../../../types/url.interface';

@Component({
  selector: 'app-url-form',
  templateUrl: './url-form.component.html',
  styleUrls: ['./url-form.component.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule],
})
export class UrlFormComponent {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  existingUrlLink = input<UrlLink | undefined>()

  formChanges = output<any>();

  formGroup = this.fb.group({
    destinationUrl: ['', [Validators.required, urlValidator()]],
    urlName: ['', [Validators.required]],
  });

  formValueChanges$ = this.formGroup.valueChanges
    .pipe(
      takeUntilDestroyed(this.destroyRef),
      tap(() =>
        this.formChanges.emit({
          value: this.formGroup.getRawValue(),
          valid: this.formGroup.valid,
        })
      )
    )
    .subscribe();

  constructor() {
    effect(() => {
      const existingUrlLink = this.existingUrlLink()

      if (existingUrlLink) {
        this.formGroup.patchValue({
          destinationUrl: existingUrlLink.destinationUrl,
          urlName: existingUrlLink.urlName
        })
      }
    })
  }

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

  ngOnDestroy(): void {
    this.formGroup.reset();
  }
}
