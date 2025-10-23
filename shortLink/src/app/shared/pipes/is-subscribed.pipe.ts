import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isSubscribed',
})
export class IsSubscribedPipe implements PipeTransform {

  transform(value: string, userProduct: string | undefined): unknown {
    if (!userProduct) return false
    return value === userProduct
  }
}
