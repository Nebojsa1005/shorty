import { computed, inject, Pipe, PipeTransform } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Pipe({
  name: 'isSubscribed',
})
export class IsSubscribedPipe implements PipeTransform {
  private authService = inject(AuthService);

  user = computed(() => this.authService.user());

  transform(value: string, userProduct: string | undefined): unknown {
    if (!userProduct) return false
    return value === userProduct
  }
}
