import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { SideMenuComponent } from './shared/components/side-menu/side-menu.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [IonicModule, SideMenuComponent],
})
export class AppComponent {}
