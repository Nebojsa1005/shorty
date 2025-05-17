import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  output,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { map, tap } from 'rxjs';
import { UrlService } from '../../../services/url.service';
import { SecurityOptions } from '../../enums/security-options.enum';
import { UrlLink } from '../../types/url.interface';
import { urlValidator } from '../../validators/url-validator.validator';

@Component({
  selector: 'app-url-form',
  templateUrl: './url-form.component.html',
  styleUrls: ['./url-form.component.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule],
})
export class UrlFormComponent implements OnDestroy {
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
