import { Pipe, PipeTransform } from '@angular/core';
import { UrlLink } from '../shared/types/url.interface';

@Pipe({
  name: 'tableSearch',
  standalone: true
})
export class TableSearchPipe implements PipeTransform {
  transform(links: UrlLink[], criteria: string | null): UrlLink[] {
    if (criteria) {
      return links.filter((link) => {
        return link.urlName.includes(criteria);
      });
    }

    return links;
  }
}
