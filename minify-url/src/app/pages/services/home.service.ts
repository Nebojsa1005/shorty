import { computed, Injectable, resource, signal, inject } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';
import { ToastServiceService } from '../../shared/services/toast-service.service';
import { Response } from '../../types/response.type';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  private http = inject(HttpClient);
  private toastService = inject(ToastServiceService)

  // State
  state = signal({
    allUrls: [],
  });

  // Selectors
  allUrls = computed(() => this.state().allUrls);

  // State updaters
  updateAllUrls(allUrls: any) {
    this.state.update((state) => ({
      ...state,
      allUrls,
    }));
  }

  // Actions
  fetchAllUrls() {
    return this.http.get<Response>(`${environment.apiUrl}/api/url/get-all-urls`).pipe(
      tap((response: Response) => {
          this.updateAllUrls(response.data)
        this.toastService.presentToast({
          position: 'top',
          message: response.message,
          color: 'primary',
        });
      }),
      catchError((error) => {
        this.toastService.presentToast({
          position: 'top',
          message: error.message,
          color: 'warning',
        });
        return of(null);
      })
    );
  }
}
