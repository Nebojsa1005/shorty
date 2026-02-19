import { Pipe, PipeTransform } from '@angular/core';
import { UrlLink } from '../types/url.interface';
import { LinkStatus } from '../enums/link-status.enum';

@Pipe({
  name: 'linkExpirationInfo',
  standalone: true,
})
export class LinkExpirationInfoPipe implements PipeTransform {
  transform(link: UrlLink): string {
    if (!link) return '';

    const now = Date.now();

    if (link.status === LinkStatus.EXPIRED && link.expiredAt) {
      const expiredAtMs = new Date(link.expiredAt).getTime();
      const daysAgo = Math.floor((now - expiredAtMs) / 86400000);
      let info = `Expired ${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago`;

      if (link.deleteAfterExpiredDays != null) {
        const daysLeft = link.deleteAfterExpiredDays - daysAgo;
        if (daysLeft > 0) {
          info += ` (deleted in ${daysLeft} day${daysLeft !== 1 ? 's' : ''})`;
        }
      }

      return info;
    }

    if (link.status === LinkStatus.ACTIVE) {
      const dates: number[] = [];

      if (link.expirationDate) {
        dates.push(new Date(link.expirationDate).getTime());
      }
      if (link.planExpiresAt) {
        dates.push(new Date(link.planExpiresAt).getTime());
      }

      if (dates.length === 0) return '';

      const soonest = Math.min(...dates);
      const daysLeft = Math.ceil((soonest - now) / 86400000);

      if (daysLeft <= 0) return 'Expiring soon';
      return `Expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`;
    }

    return '';
  }
}
