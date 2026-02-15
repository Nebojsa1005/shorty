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
  subscriptionProductName = computed(
    () => this.state().subscriptionProduct?.attributes?.name
  );
  subscriptionProduct = computed(() => this.state().subscriptionProduct);

  getAllProducts() {
    return this.http
      .get(`${environment.apiUrl}/api/products`)
      .pipe(
        tap((data: any) => {
          this.updateState('products', data.data);
        }),
        catchError((error) => {
          this.toastService.presentToast({
            position: 'bottom',
            message: error.error?.message || 'Failed to fetch products',
            color: 'danger',
          });
          return of(null);
        })
      );
  }

  cancelSubscription() {
    return this.http
      .delete(
        `${environment.apiUrl}/api/subscriptions/${
          this.user()?.subscription.subscriptionId
        }`, {
          body: {
            userId: this.user()?._id,
          }
        }
      )
      .pipe(
        switchMap(() => {
          return this.http
            .post(`${environment.apiUrl}/api/remove-subscription`, {
              userId: this.user()?._id,
            })
            .pipe(switchMap((res: any) => this.authService.refreshUser()));
        }),
        catchError((error) => {
          this.toastService.presentToast({
            position: 'bottom',
            message: error.error?.message || 'Failed to cancel subscription',
            color: 'danger',
          });
          return of(null);
        })
      );
  }

  getProductById(productId: string | undefined) {
    return this.http
      .get(`${environment.apiUrl}/api/products/${productId}`)
      .pipe(
        tap((data: any) => {
          this.updateState('subscriptionProduct', data.data);
        }),
        catchError((error) => {
          this.toastService.presentToast({
            position: 'bottom',
            message: error.error?.message || 'Failed to fetch product',
            color: 'danger',
          });
          return of(null);
        })
      );
  }

  getBillingHistory(userId: string, page = 2, size = 20) {
    return this.http.get<any>(
      `${environment.apiUrl}/api/subscription-invoices?user_id=${userId}&page=${page}&size=${size}`
    ).pipe(
      tap((a) => console.log(a) )
    );
  }

  // State updaters
  updateState<K extends keyof PricingState>(prop: K, value: PricingState[K]) {
    this.state.update((state) => ({
      ...state,
      [prop]: value,
    }));
  }
}
