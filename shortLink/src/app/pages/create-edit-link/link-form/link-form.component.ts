import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, effect, ElementRef, inject, input, output, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { tap } from 'rxjs';
import { UrlService } from '../../../services/url.service';
import { urlValidator } from '../../../shared/validators/url-validator.validator';
import { SecurityOptions } from '../../../shared/enums/security-options.enum';
import { UrlLink } from '../../../shared/types/url.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-link-form',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatOptionModule,
        MatButtonModule,
        MatIconModule,
        MatDatepickerModule,
        MatNativeDateModule,
    ],
    templateUrl: './link-form.component.html',
    styleUrl: './link-form.component.scss'
})
export class LinkFormComponent {
   private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private urlService = inject(UrlService);

  // View child
  @ViewChild('expirationDateInput')
  expirationDateInput!: ElementRef;

  SecurityOptions = SecurityOptions;
  currentTime = new Date().toISOString()

  // Inputs
  existingUrlLink = input<UrlLink | undefined>();

  // Outputs
  formChanges = output<any>();

  // Computed
  securityOptions = computed(() => this.urlService.securityOptions());

  formGroup = this.fb.group({
    destinationUrl: ['', [Validators.required, urlValidator()]],
    urlName: ['', [Validators.required]],
    suffix: ['', [Validators.maxLength(20)]],
    security: [''],
    password: [''],
    expirationDate: [''],
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

  get destinationUrlError() {
    if (this.formGroup.get('destinationUrl')?.hasError('required')) {
      return 'This Field is Required';
    } else {
      return 'Must be a valid URL';
    }
  }

  get passwordError() {
    return this.controls.password.hasError('passwordRequired')
      ? 'This Field is Required'
      : null;
  }

  get controls() {
    return this.formGroup.controls;
  }

  constructor() {
    effect(() => {
      const existingUrlLink = this.existingUrlLink();

      if (existingUrlLink) {
        this.formGroup.patchValue({
          destinationUrl: existingUrlLink.destinationUrl,
          urlName: existingUrlLink.urlName,
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.formGroup.reset();
  }
}
