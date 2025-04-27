import { HttpClient, HttpStatusCode } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { catchError, of, tap } from 'rxjs';
import { ToastServiceService } from '../../../shared/services/toast-service.service';
import { Response } from '../../../types/response.type';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class NewLinkService {
  private http = inject(HttpClient);
  private toastService = inject(ToastServiceService);
  private router = inject(Router);

  createNewLink(payload: any) {
    return this.http
      .post<Response>(`${environment.apiUrl}/api/url/minify`, {
        destinationUrl: payload,
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
            color: 'warning'
          })
          return of(null);
        })
      );
  }
}
