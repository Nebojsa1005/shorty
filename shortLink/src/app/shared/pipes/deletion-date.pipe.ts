import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import { UrlLink } from '../types/url.interface';
import { LinkStatus } from '../enums/link-status.enum';

@Pipe({ name: 'deletionDate', standalone: true })
export class DeletionDatePipe implements PipeTransform {
  private datePipe = new DatePipe('en-US');

  transform(link: UrlLink): string {
    if (!link?.deleteAfterExpiredDays) return '—';

    if (link.status === LinkStatus.EXPIRED && link.expiredAt) {
      const deleteAt = new Date(link.expiredAt).getTime() + link.deleteAfterExpiredDays * 86400000;
      return this.datePipe.transform(new Date(deleteAt), 'mediumDate') ?? '—';
    }

    return `${link.deleteAfterExpiredDays}d after expiry`;
  }
}
