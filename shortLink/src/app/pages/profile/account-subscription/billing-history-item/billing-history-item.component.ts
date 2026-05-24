import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-billing-history-item',
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './billing-history-item.component.html',
  styleUrl: './billing-history-item.component.scss',
  standalone: true,
})
export class BillingHistoryItemComponent {
  invoice = input.required<any>();
  productName = input.required<string>();

  loadingReceipt = signal(false);

  viewReceipt() {
    const url = this.invoice().attributes?.urls?.invoice_url;
    if (!url) return;

    this.loadingReceipt.set(true);
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.click();
    setTimeout(() => this.loadingReceipt.set(false), 2000);
  }
}
