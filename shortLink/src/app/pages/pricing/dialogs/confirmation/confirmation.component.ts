import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

export type PaymentStatus = 'processing' | 'success' | 'failed';

@Component({
  selector: 'app-confirmation',
  imports: [
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    CommonModule,
  ],
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.scss',
  standalone: true,
})
export class ConfirmationComponent {
  public dialogRef = inject(MatDialogRef<ConfirmationComponent>);

  status = signal<PaymentStatus>('processing');
  message = signal<string>('We are processing your payment. Please wait...');

  updateStatus(status: PaymentStatus, message?: string) {
    this.status.set(status);
    if (message) {
      this.message.set(message);
    } else {
      // Default messages
      switch (status) {
        case 'success':
          this.message.set('Payment successful! Your subscription is now active.');
          break;
        case 'failed':
          this.message.set('Payment failed. Please check your payment method and try again.');
          break;
        case 'processing':
          this.message.set('We are processing your payment. Please wait...');
          break;
      }
    }
  }

  close() {
    this.dialogRef.close();
  }
}
