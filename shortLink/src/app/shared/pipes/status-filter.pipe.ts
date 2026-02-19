import { Pipe, PipeTransform } from '@angular/core';
import { UrlLink } from '../types/url.interface';

@Pipe({
  name: 'statusFilter',
  standalone: true,
})
export class StatusFilterPipe implements PipeTransform {
  transform(links: UrlLink[] | null, status: string | null): UrlLink[] {
    if (!links) return [];
    if (!status || status === 'all') return links;
    return links.filter((link) => link.status === status);
  }
}
