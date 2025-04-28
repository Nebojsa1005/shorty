import { HttpClient, HttpStatusCode } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { catchError, of, switchMap, tap } from 'rxjs';
import { ToastServiceService } from '../../../shared/services/toast-service.service';
import { Response } from '../../../types/response.type';
import { Router } from '@angular/router';
import { HomeService } from '../../services/home.service';

export interface CreateNewLinkPayload {
  destinationUrl: string;
  urlName: string;
}

@Injectable({
  providedIn: 'root',
})
export class NewLinkService {
  private http = inject(HttpClient);
  private toastService = inject(ToastServiceService);
  private router = inject(Router);
  private homeService = inject(HomeService)

  createNewLink({ destinationUrl, urlName }: CreateNewLinkPayload) {
    return this.http
      .post<Response>(`${environment.apiUrl}/api/url/minify`, {
        destinationUrl,
        urlName,
      })
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
        switchMap(() => this.homeService.fetchAllUrls())
      );
  }
}
