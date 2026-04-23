import { CommonModule } from '@angular/common';
import { Component, inject, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Router, RouterModule } from '@angular/router';
import { UrlService } from 'src/app/services/url.service';
import { environment } from 'src/environments/environment';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-side-menu',
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    RouterModule,
    MatButtonModule,
  ],
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent {
  private authService = inject(AuthService);
  private urlService = inject(UrlService);
  private router = inject(Router);

  environment = environment; // FEATURE FLAG

  itemClicked = output<void>();
  constructor() {
    console.log({ environment });
  }

  navigate(path: string) {
    this.router.navigateByUrl(path);
  }

  onNavItemClick() {
    this.itemClicked.emit();
  }

  onLogout() {
    this.authService.logout();
  }

  newLink() {
    this.urlService.updateState('isCreateEditLinkDrawerOpened', true);
  }
}
