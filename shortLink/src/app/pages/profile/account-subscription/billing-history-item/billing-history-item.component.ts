import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PricingService } from 'src/app/services/pricing.service';

@Component({
  selector: 'app-billing-history-item',
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './billing-history-item.component.html',
  styleUrl: './billing-history-item.component.scss',
  standalone: true,
})
export class BillingHistoryItemComponent {
  private pricingService = inject(PricingService);
  private destroyRef = inject(DestroyRef);

  invoice = input.required<any>();
  productName = input.required<string>();

  loadingReceipt = signal(false);

  viewReceipt() {
    this.loadingReceipt.set(true);
    this.pricingService
      .getInvoiceUrl(this.invoice().id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (url) => {
          console.log(url);
          
          this.loadingReceipt.set(false);
          this.openUrl(url, this.invoice().id);
        },
        error: () => {
          this.loadingReceipt.set(false);
        },
      });
  }

  private openUrl(invoiceUrl: string, invoiceId: string) {
    const a = document.createElement('a');
    a.href = invoiceUrl;
    a.download = `receipt-${invoiceId}.pdf`;
    a.target = '_blank';
    a.click();
  }
}
