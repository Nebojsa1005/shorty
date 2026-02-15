import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-billing-history-item',
  imports: [CommonModule],
  templateUrl: './billing-history-item.component.html',
  styleUrl: './billing-history-item.component.scss',
  standalone: true,
})
export class BillingHistoryItemComponent {
  invoice = input.required<any>();
  productName = input.required<string>();
}
