import { Component, effect, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { SideMenuComponent } from './shared/components/side-menu/side-menu.component';
import { AuthService } from './pages/auth/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [IonicModule, SideMenuComponent],
})
export class AppComponent {}
