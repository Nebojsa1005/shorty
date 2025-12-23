import { Injectable, inject } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarConfig,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { ToastDuration } from '../shared/enums/toast.enum';

interface ToastPayload {
  position?: 'top' | 'bottom';
  message: string;
  duration?: number;
  color?: 'primary' | 'warning' | 'danger'; // You can use this for styling if needed
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private snackBar = inject(MatSnackBar);

  presentToast({
    position = 'bottom',
    message,
    duration = ToastDuration.MEDIUM,
    color,
  }: ToastPayload) {
    const config: MatSnackBarConfig = {
      duration,
      verticalPosition: position as MatSnackBarVerticalPosition,
      horizontalPosition: 'center' as MatSnackBarHorizontalPosition,
      panelClass: color ? [`toast-${color}`] : undefined, // custom class if color provided
    };

    this.snackBar.open(message, 'Close', config);
  }
}
