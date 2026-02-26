import { Component, computed, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UrlService } from 'src/app/services/url.service';
import { PlanFeaturesService } from '../../../services/plan-features.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-side-menu',
    imports: [CommonModule, MatListModule, MatIconModule, RouterModule, MatButtonModule],
    templateUrl: './side-menu.component.html',
    styleUrls: ['./side-menu.component.scss']
})
export class SideMenuComponent {
  private authService = inject(AuthService);
  private urlService = inject(UrlService);
  private planFeaturesService = inject(PlanFeaturesService);
  private router = inject(Router);

  planName = computed(() => this.planFeaturesService.planName());

  itemClicked = output<void>();

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
    this.itemClicked.emit();
  }
}
