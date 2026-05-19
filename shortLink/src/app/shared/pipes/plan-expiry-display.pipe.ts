import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({ name: 'planExpiryDisplay', standalone: true })
export class PlanExpiryDisplayPipe implements PipeTransform {
  private datePipe = new DatePipe('en-US');

  transform(date: string | null | undefined): string {
    if (!date) return 'Never';

    const ms = new Date(date).getTime();
    const daysLeft = Math.ceil((ms - Date.now()) / 86400000);
    const formatted = this.datePipe.transform(date, 'mediumDate') ?? date;

    if (daysLeft > 0) return `${daysLeft}d · ${formatted}`;
    return `Expired · ${formatted}`;
  }
}
