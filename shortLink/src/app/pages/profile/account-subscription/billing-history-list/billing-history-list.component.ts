import { Component, computed, DestroyRef, inject, input, signal, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { PricingService } from 'src/app/services/pricing.service';
import { BillingHistoryItemComponent } from '../billing-history-item/billing-history-item.component';

@Component({
  selector: 'app-billing-history-list',
  imports: [
    CommonModule,
    MatProgressSpinner,
    MatIconButton,
    MatIcon,
    BillingHistoryItemComponent,
  ],
  templateUrl: './billing-history-list.component.html',
  styleUrl: './billing-history-list.component.scss',
  standalone: true,
})
export class BillingHistoryListComponent implements OnInit {
  private pricingService = inject(PricingService);
  private destroyRef = inject(DestroyRef);

  userId = input.required<string>();

  invoices = signal<any[]>([]);
  loading = signal(false);
  currentPage = signal(1);
  lastPage = signal(1);

  hasPrev = computed(() => this.currentPage() > 1);
  hasNext = computed(() => this.currentPage() < this.lastPage());

  ngOnInit() {
    this.loadPage(1);
  }

  loadPage(page: number) {
    this.loading.set(true);
    this.pricingService
      .getBillingHistory(this.userId(), page)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          this.invoices.set(res.data || []);
          this.currentPage.set(res.meta?.page?.currentPage || 1);
          this.lastPage.set(res.meta?.page?.lastPage || 1);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  prev() {
    if (this.hasPrev()) this.loadPage(this.currentPage() - 1);
  }

  next() {
    if (this.hasNext()) this.loadPage(this.currentPage() + 1);
  }
}
