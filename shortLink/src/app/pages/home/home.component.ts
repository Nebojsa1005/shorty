import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterOutlet } from '@angular/router';
import { UrlService } from 'src/app/services/url.service';
import { SideMenuComponent } from 'src/app/shared/components/side-menu/side-menu.component';
import { CreateEditLinkComponent } from '../create-edit-link/create-edit-link.component';

@Component({
  selector: 'app-home',
  imports: [
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    RouterOutlet,
    SideMenuComponent,
    CreateEditLinkComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private breakpointObserver = inject(BreakpointObserver);
  private urlService = inject(UrlService);

  isDrawerOpened = signal(true);

  isCreateEditLinkDrawerOpened = computed(() =>
    this.urlService.isCreateEditLinkDrawerOpened()
  );

  constructor() {
    this.breakpointObserver
      .observe([Breakpoints.Small, Breakpoints.Handset])
      .subscribe((state) => {
        this.isDrawerOpened.set(!state.matches);
      });
  }

  resetCreateEditLinkDrawer() {
    this.urlService.updateState('idToEdit', null);
    this.urlService.updateState('isCreateEditLinkDrawerOpened', false);
  }
}
