import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, of, switchMap, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ToastService } from './toast-service.service';
import { AuthService } from './auth.service';

interface PricingState {
  products: any;
  subscriptionProduct: any;
}

@Injectable({
  providedIn: 'root',
})
export class PricingService {
  private http = inject(HttpClient);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);

  state = signal<PricingState>({
    products: null,
    subscriptionProduct: null,
  });

  products = computed(() => this.state().products);
  user = computed(() => this.authService.user());
  subscriptionProductName = computed(() => this.state().subscriptionProduct?.attributes?.name)

  getAllProducts() {
    return this.http
      .get(`${environment.lemonSquezzyRootUrl}/products`, {
        headers: {
          Accept: 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
          Authorization: `Bearer ${environment.lemonSquezzyApiKey}`,
        },
      })
      .pipe(
        tap((data: any) => {
          this.updateState('products', data.data);
        }),
        catchError((error) => {
          this.toastService.presentToast({
            position: 'top',
            message: error.error.message,
            color: 'danger',
          });
          return of(null);
        })
      );
  }

  cancelSubscription() {
    this.http.delete(
        `${environment.lemonSquezzyRootUrl}/subscriptions/${
          this.user()?.subscription.subscriptionId
        }`,
      {
        headers: {
          Accept: 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
          Authorization: `Bearer ${environment.lemonSquezzyApiKey}`,
        },
      }
    );
  }

  getProductById(productId: string | undefined) {
   return this.http
      .get(`${environment.lemonSquezzyRootUrl}/products/${productId}`, {
        headers: {
          Accept: 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
          Authorization: `Bearer ${environment.lemonSquezzyApiKey}`,
        },
      })
      .pipe(
        tap((data: any) => {
          this.updateState("subscriptionProduct", data.data);
        }),
        catchError((error) => {
          this.toastService.presentToast({
            position: 'top',
            message: error.error.message,
            color: 'danger',
          });
          return of(null);
        })
      ) 
  }

  // State updaters
  updateState<K extends keyof PricingState>(prop: K, value: PricingState[K]) {
    this.state.update((state) => ({
      ...state,
      [prop]: value,
    }));
  }
}
