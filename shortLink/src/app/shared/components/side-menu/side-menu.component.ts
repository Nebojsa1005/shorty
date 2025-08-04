import { Component, inject } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UrlService } from 'src/app/services/url.service';

@Component({
    selector: 'app-side-menu',
    imports: [MatListModule, MatIconModule, RouterModule],
    templateUrl: './side-menu.component.html',
    styleUrls: ['./side-menu.component.scss']
})
export class SideMenuComponent {
  private authService = inject(AuthService);
  private urlService = inject(UrlService)

  constructor(private router: Router) {}

  navigate(path: string) {
    this.router.navigateByUrl(path);
  }

  onLogout() {
    this.authService.logout();
  }

  newLink() {
    this.urlService.updateState('isCreateEditLinkDrawerOpened', true)
  }
}
