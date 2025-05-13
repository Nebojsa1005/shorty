import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, of, switchMap, take, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { ToastServiceService } from '../../shared/services/toast-service.service';
import { Response } from '../../shared/types/response.type';
import { UrlForm, UrlLink } from '../../shared/types/url.interface';
import { AuthService } from '../auth/services/auth.service';

interface UrlState {
  allUrls: UrlLink[];
  urlForm: UrlForm | null;
}

@Injectable({
  providedIn: 'root',
})
export class UrlService {
  private http = inject(HttpClient);
  private toastService = inject(ToastServiceService);
  private router = inject(Router);
  private authService = inject(AuthService)

  // State
  state = signal<UrlState>({
    allUrls: [],
    urlForm: null,
  });

  // Selectors
  allUrls = computed(() => this.state().allUrls);
  urlForm = computed(() => this.state().urlForm);
  user = computed(() => this.authService.user())

  // State updaters
  updateAllUrls(allUrls: UrlLink[]) {
    this.state.update((state) => ({
      ...state,
      allUrls,
    }));
  }

  updateUrlForm(urlForm: UrlForm) {
    this.state.update((state) => ({
      ...state,
      urlForm,
    }));
  }

  // Actions
  fetchAllUrls() {
    return this.http
      .get<Response>(`${environment.apiUrl}/api/url/get-all-urls/${this.user()?._id}`)
      .pipe(
        tap((response: Response) => {
          this.updateAllUrls(response.data);
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

  getUrlLinkById(id: string) {
    return this.http
      .get<Response>(`${environment.apiUrl}/api/url/get-by-id/${id}`)
      .pipe(
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

  createNewLink() {  
    const userId = this.user()?._id
    if (!userId) return of(null)

      console.log(userId);
      

    return this.http
      .post<Response>(
        `${environment.apiUrl}/api/url/minify`,
        { formData: this.urlForm()?.value, userId}
      )
      .pipe(
        tap((response: Response) => {
          this.toastService.presentToast({
            position: 'top',
            message: response.message,
            color: 'primary',
          });

          this.router.navigate(['/']);
        }),
        catchError((error) => {
          this.toastService.presentToast({
            position: 'top',
            message: error.message,
            color: 'warning',
          });
          return of(null);
        }),
        switchMap(() => this.fetchAllUrls())
      );
  }

  editLink(id: string) {
    return this.http
      .put<Response>(`${environment.apiUrl}/api/url/edit/${id}`, {
        urlForm: this.urlForm()?.value,
      })
      .pipe(
        tap((response: Response) => {
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
        }),
        switchMap(() => this.fetchAllUrls())
      );
  }

  deleteLink(id: string) {
    return this.http
      .post<Response>(`${environment.apiUrl}/api/url/delete/${id}`, {})
      .pipe(
        take(1),
        tap((response: Response) => {
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
        }),
        switchMap(() => this.fetchAllUrls())
      );
  }
}
