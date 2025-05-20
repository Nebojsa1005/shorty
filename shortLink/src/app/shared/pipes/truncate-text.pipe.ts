import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateText',
  standalone: true
})
export class TruncateTextPipe implements PipeTransform {

  transform(value: string, size = 30): string {
    if (value.length > size) {
      return `${value.substring(0, size)}...` 
    }
    return value;
  }

}
