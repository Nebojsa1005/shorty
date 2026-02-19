import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, of, switchMap, take, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Response } from '../shared/types/response.type';
import {
  UrlForm,
  UrlLink,
  UrlSecurityOption,
} from '../shared/types/url.interface';
import { SecurityOptions } from '../shared/enums/security-options.enum';
import { ToastService } from './toast-service.service';
import { AuthService } from './auth.service';
import { ToastDuration } from '../shared/enums/toast.enum';

interface UrlState {
  allUrls: UrlLink[];
  allUrlsLoading: boolean;
  idToEdit: string | null;
  urlForm: UrlForm | null;
  isCreateEditLinkDrawerOpened: boolean
  securityOptions: UrlSecurityOption[];
}

@Injectable({
  providedIn: 'root',
})
export class UrlService {
  private http = inject(HttpClient);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private authService = inject(AuthService);

  // State
  state = signal<UrlState>({
    allUrls: [],
    allUrlsLoading: false,
    urlForm: null,
    isCreateEditLinkDrawerOpened: false,
    idToEdit: null,
    securityOptions: [
      {
        description: 'None',
        value: SecurityOptions.NONE
      },
      {
        description: 'Password',
        value: SecurityOptions.PASSWORD,
      },
    ],
  });

  // Selectors
  allUrls = computed(() => this.state().allUrls);
  urlForm = computed(() => this.state().urlForm);
  user = computed(() => this.authService.user());
  securityOptions = computed(() => this.state().securityOptions);
  allUrlsLoading = computed(() => this.state().allUrlsLoading);
  isCreateEditLinkDrawerOpened = computed(() => this.state().isCreateEditLinkDrawerOpened)
  idToEdit = computed(() => this.state().idToEdit)
  canCreateLink = computed(() => {
    const linksAllowed = this.user()?.subscription?.linksAllowed ?? 0;
    const currentLinkCount = this.allUrls().length;
    return currentLinkCount < linksAllowed;
  });

  // State updaters
  updateState<K extends keyof UrlState>(prop: K, value: UrlState[K]) {
    console.log({
      prop, value
    });
    
    this.state.update((state) => ({
      ...state,
      [prop]: value,
    }));
  }

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
    this.updateState('allUrlsLoading', true)
    return this.http
      .get<Response>(
        `${environment.apiUrl}/api/url/get-all-urls/${this.user()?._id}`
      )
      .pipe(
        tap((response: Response) => {
          this.updateAllUrls(response.data);
          this.updateState('allUrlsLoading', false)
        }),
        catchError((error) => {
          this.toastService.presentToast({
            position: 'bottom',
            message: error.message,
            color: 'warning',
          });
          return of(null);
        })
      );
  }

  getShortLinkById(id: string) {
    return this.http
      .get<Response>(`${environment.apiUrl}/api/url/get-by-id/${id}`)
      .pipe(
        catchError((error) => {
          this.toastService.presentToast({
            position: 'bottom',
            message: error.error.message,
            color: 'danger',
          });
          return of(null);
        })
      );
  }

  getShortLinkByShortLinkId(id: string, suffix: string) {
    const options = suffix
      ? { params: new HttpParams().set('suffix', suffix) }
      : {};

    return this.http
      .get<Response>(
        `${environment.apiUrl}/api/url/get-by-short-link-id/${id}`,
        options
      )
      .pipe(
        catchError((error) => {
          this.toastService.presentToast({
            position: 'bottom',
            message: error.error.message,
            color: 'danger',
          });
          return of(null);
        })
      );
  }

  createNewLink() {
    const userId = this.user()?._id;
    if (!userId) return of(null);

    return this.http
      .post<Response>(`${environment.apiUrl}/api/url/create`, {
        formData: this.urlForm()?.value,
        userId,
      })
      .pipe(
        tap((response: Response) => {
          this.toastService.presentToast({
            position: 'bottom',
            message: response.message,
            color: 'primary',
          });

          this.router.navigate(['all-links']);
        }),
        catchError((error) => {
          console.log(error);
          
          this.toastService.presentToast({
            position: 'bottom',
            message: error.error.message,
            color: 'warning',
            duration: ToastDuration.LONG,
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
        resetAnalytics: this.urlForm()?.resetAnalytics ?? false,
      })
      .pipe(
        tap((response: Response) => {
          this.router.navigate(['all-links']);
          this.toastService.presentToast({
            position: 'bottom',
            message: response.message,
            color: 'primary',
          });
        }),
        catchError((error) => {
          this.toastService.presentToast({
            position: 'bottom',
            message: error.error.message,
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
            position: 'bottom',
            message: response.message,
            color: 'primary',
          });
        }),
        catchError((error) => {
          this.toastService.presentToast({
            position: 'bottom',
            message: error.error.message,
            color: 'warning',
          });
          return of(null);
        }),
        switchMap(() => this.fetchAllUrls())
      );
  }

  reactivateLink(id: string, expirationDate: string | null) {
    const userId = this.user()?._id;
    if (!userId) return of(null);

    return this.http
      .put<Response>(`${environment.apiUrl}/api/url/reactivate/${id}`, {
        expirationDate,
        userId,
      })
      .pipe(
        tap((response: Response) => {
          this.toastService.presentToast({
            position: 'bottom',
            message: response.message,
            color: 'primary',
          });
        }),
        catchError((error) => {
          this.toastService.presentToast({
            position: 'bottom',
            message: error.error.message,
            color: 'warning',
          });
          return of(null);
        }),
        switchMap(() => this.fetchAllUrls())
      );
  }

  cloneLink(id: string) {
    const userId = this.user()?._id;
    if (!userId) return of(null);

    return this.http
      .post<Response>(`${environment.apiUrl}/api/url/clone/${id}`, {
        userId,
      })
      .pipe(
        tap((response: Response) => {
          this.toastService.presentToast({
            position: 'bottom',
            message: response.message,
            color: 'primary',
          });
        }),
        catchError((error) => {
          this.toastService.presentToast({
            position: 'bottom',
            message: error.error.message,
            color: 'warning',
          });
          return of(null);
        }),
        switchMap(() => this.fetchAllUrls())
      );
  }

  passwordCheck(password: string, id: string, destinationUrl: string) {
    return this.http
      .get<Response>(
        `${environment.apiUrl}/api/url/password-check/${password}/${id}`
      )
      .pipe(
        tap(() => (window.location.href = destinationUrl)),
        catchError((error) => {
          this.toastService.presentToast({
            position: 'bottom',
            message: error.error.message,
            color: 'danger',
          });
          return of(null);
        })
      );
  }
}
