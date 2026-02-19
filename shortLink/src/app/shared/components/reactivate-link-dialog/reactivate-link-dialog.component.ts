import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';

export interface ReactivateDialogData {
  linkName: string;
}

@Component({
  selector: 'app-reactivate-link-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
  ],
  templateUrl: './reactivate-link-dialog.component.html',
  styleUrl: './reactivate-link-dialog.component.scss',
  standalone: true,
})
export class ReactivateLinkDialogComponent {
  private dialogRef = inject(MatDialogRef<ReactivateLinkDialogComponent>);
  private data: ReactivateDialogData = inject(MAT_DIALOG_DATA);

  linkName = this.data.linkName;
  noExpiration = signal(false);
  expirationDateControl = new FormControl<Date | null>(null);
  minDate = new Date();

  toggleNoExpiration() {
    this.noExpiration.update((v) => !v);
    if (this.noExpiration()) {
      this.expirationDateControl.reset();
    }
  }

  onCancel() {
    this.dialogRef.close(null);
  }

  onReactivate() {
    const expirationDate = this.noExpiration()
      ? null
      : this.expirationDateControl.value?.toISOString() ?? null;

    this.dialogRef.close({ expirationDate });
  }
}
