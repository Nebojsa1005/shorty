import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { tap } from 'rxjs';
import { ANALYTICS_OPTIONS, AnalyticsOption } from '../../../shared/consts/analytics-options.const';
import { UrlService } from '../../../services/url.service';
import { PlanFeaturesService } from '../../../services/plan-features.service';
import { UpgradePromptComponent } from '../../../shared/components/upgrade-prompt/upgrade-prompt.component';
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
    MatRadioModule,
    RouterModule,
    UpgradePromptComponent,
  ],
  templateUrl: './link-form.component.html',
  styleUrl: './link-form.component.scss',
})
export class LinkFormComponent {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private urlService = inject(UrlService);
  planFeatures = inject(PlanFeaturesService);

  // View child
  @ViewChild('expirationDateInput')
  expirationDateInput!: ElementRef;

  SecurityOptions = SecurityOptions;
  ANALYTICS_OPTIONS = ANALYTICS_OPTIONS;
  currentTime = new Date().toISOString();
  showPassword = false;

  // Inputs
  existingUrlLink = input<UrlLink | undefined>();
  isEdit = input<boolean>(false);

  // Outputs
  formChanges = output<any>();

  // Computed
  securityOptions = computed(() => this.urlService.securityOptions());
  isCreateEditLinkDrawerOpened = computed(() =>
    this.urlService.isCreateEditLinkDrawerOpened()
  );

  // Plan-gating computed
  isPasswordDisabled  = computed(() => !this.planFeatures.canUsePasswordProtection());
  isExpirationHidden  = computed(() => this.planFeatures.isEssential());
  expirationMaxDate   = computed(() => this.planFeatures.maxExpirationDate());
  suffixMaxLength     = computed(() => this.planFeatures.maxSuffixLength());
  suffixHint          = computed(() => {
    const max = this.planFeatures.maxSuffixLength();
    return max === null ? 'Unlimited characters' : `Max ${max} characters`;
  });

  formGroup = this.fb.group({
    destinationUrl: ['', [Validators.required, urlValidator()]],
    urlName: ['', [Validators.required]],
    suffix: ['', [Validators.maxLength(20)]],
    security: [0],
    password: [''],
    expirationDate: [''],
  });

  resetAnalyticsControl = new FormControl<AnalyticsOption>(ANALYTICS_OPTIONS.KEEP);

  resetAnalyticsChanges$ = this.resetAnalyticsControl.valueChanges
    .pipe(
      takeUntilDestroyed(this.destroyRef),
      tap(() => this.emitFormChanges())
    )
    .subscribe();

  securityOptionsChanges$ = this.controls.security.valueChanges
    .pipe(
      takeUntilDestroyed(this.destroyRef),
      tap((value) => {
        const passwordControl = this.controls.password;

        // If Essential tries to select password, reset to NONE
        if (value === SecurityOptions.PASSWORD && this.isPasswordDisabled()) {
          this.controls.security.setValue(SecurityOptions.NONE, { emitEvent: false });
          passwordControl.setValue('');
          passwordControl.disable();
          passwordControl.removeValidators(Validators.required);
          this.formGroup.updateValueAndValidity();
          return;
        }

        if (value === SecurityOptions.PASSWORD) {
          passwordControl.setValidators(Validators.required);
          passwordControl.enable();
        } else {
          passwordControl.setValue('');
          passwordControl.disable();
          passwordControl.removeValidators(Validators.required);
        }
        this.formGroup.updateValueAndValidity();
      })
    )
    .subscribe();

  formValueChanges$ = this.formGroup.valueChanges
    .pipe(
      takeUntilDestroyed(this.destroyRef),
      tap(() => this.emitFormChanges())
    )
    .subscribe();

  get destinationUrlError() {
    if (this.formGroup.get('destinationUrl')?.hasError('required')) {
      return 'This Field is Required';
    } else {
      return 'Must be a valid URL';
    }
  }

  get isSecurityPassword() {
    const securityPassword =
      this.controls.security.getRawValue() === SecurityOptions.PASSWORD;

    if (securityPassword) this.controls.password.enable();
    else this.controls.password.disable();

    return securityPassword;
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
          expirationDate: existingUrlLink.expirationDate,
          security: existingUrlLink.security,
          suffix: existingUrlLink.suffix,
          urlName: existingUrlLink.urlName,
        });
      }
    });

    effect(() => {
      if (!this.isCreateEditLinkDrawerOpened()) {
        this.formGroup.reset();
        this.resetAnalyticsControl.setValue(ANALYTICS_OPTIONS.KEEP);
      }
    });

    // Update suffix maxLength validator when plan changes
    effect(() => {
      const maxLen = this.suffixMaxLength();
      const suffixControl = this.controls.suffix;
      if (maxLen === null) {
        suffixControl.clearValidators();
      } else {
        suffixControl.setValidators([Validators.maxLength(maxLen)]);
      }
      suffixControl.updateValueAndValidity({ emitEvent: false });
    });
  }

  emitFormChanges() {
    this.formChanges.emit({
      value: this.formGroup.getRawValue(),
      valid: this.formGroup.valid,
      resetAnalytics: this.resetAnalyticsControl.value === ANALYTICS_OPTIONS.RESET,
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  ngOnDestroy(): void {
    this.formGroup.reset();
    this.resetAnalyticsControl.setValue(ANALYTICS_OPTIONS.KEEP);
  }
}
