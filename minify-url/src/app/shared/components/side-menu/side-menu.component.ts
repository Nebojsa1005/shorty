import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ionIcons } from '../../../../icons';
import { Router } from '@angular/router';

@Component({
    selector: 'app-side-menu',
    templateUrl: './side-menu.component.html',
    styleUrls: ['./side-menu.component.scss'],
    imports: [IonicModule]
})
export class SideMenuComponent {

  private router = inject(Router)

  ionIcons = ionIcons;

  navigate(route: string) {
    this.router.navigate([route])
  }
}
