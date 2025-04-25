import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { urlValidator } from '../../shared/validators/url-validator.validator';

@Component({
  selector: 'app-new-link',
  templateUrl: './new-link.component.html',
  styleUrls: ['./new-link.component.scss'],
  imports: [IonicModule, ReactiveFormsModule],
  standalone: true,
})
export class NewLinkComponent {
  private fb = inject(FormBuilder);

  get destinationUrlError() {
    if (this.formGroup.get('destinationUrl')?.hasError('required')) {
      return 'This field is required'
    } else {
      return 'Must be a valid URL'
    }
  }

  formGroup = this.fb.group({
    destinationUrl: ['', [Validators.required, urlValidator()]],
  });

  onSubmit() {
    
  }
}
