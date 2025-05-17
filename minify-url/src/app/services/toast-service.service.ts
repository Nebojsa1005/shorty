import { inject, Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

interface ToastPayload {
  position: 'top' | 'bottom' | 'middle' | undefined;
  message: string;
  duration?: number;
  color: 'primary' | 'warning' | 'danger';
}

@Injectable({
  providedIn: 'root',
})
export class ToastServiceService {
  private toastController = inject(ToastController);

  async presentToast({ position, message, duration, color }: ToastPayload) {
    const toast = await this.toastController.create({
      message,
      duration: duration ? duration : 2000,
      position,
      color,
      animated: true,
      positionAnchor: 'header',
      
    });

    await toast.present();
  }
}
