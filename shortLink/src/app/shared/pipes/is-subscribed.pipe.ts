import { computed, inject, Pipe, PipeTransform } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Pipe({
  name: 'isSubscribed',
})
export class IsSubscribedPipe implements PipeTransform {
  private authService = inject(AuthService);

  user = computed(() => this.authService.user());

  transform(value: string): unknown {
    return value === this.user()?.subscription?.productId;
  }
}
