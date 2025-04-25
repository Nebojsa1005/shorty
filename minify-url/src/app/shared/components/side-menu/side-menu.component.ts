import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ionIcons } from '../../../../icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class SideMenuComponent {

  private router = inject(Router)

  ionIcons = ionIcons;

  onAddNew() {
    this.router.navigate(['/add-new-link'])
  }
}
