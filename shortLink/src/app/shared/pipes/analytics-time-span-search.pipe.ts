import { Pipe, PipeTransform } from '@angular/core';
import { UrlLink } from '../types/url.interface';

@Pipe({
  name: 'analyticsTimeSpanSearch'
})
export class AnalyticsTimeSpanSearchPipe implements PipeTransform {
 transform(links: UrlLink[], criteria: string | null): UrlLink[] {
    if (criteria) {
      return links.filter((link) => {
        return link.urlName.toLocaleLowerCase().includes(criteria.toLocaleLowerCase());
      });
    }

    return links;
  }

}
