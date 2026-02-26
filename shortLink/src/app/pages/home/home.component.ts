import { DOCUMENT } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
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
  private document = inject(DOCUMENT);

  drawer = viewChild<MatSidenav>('drawer');

  isDrawerOpened = signal(true);
  sidenavMode = signal<'side' | 'over'>('side');
  private drawerActuallyOpened = signal(true);

  isCreateEditLinkDrawerOpened = computed(() =>
    this.urlService.isCreateEditLinkDrawerOpened()
  );

  constructor() {
    this.breakpointObserver
      .observe([Breakpoints.Small, Breakpoints.Handset])
      .subscribe((state) => {
        this.isDrawerOpened.set(!state.matches);
        this.sidenavMode.set(state.matches ? 'over' : 'side');
      });

    effect(() => {
      const shouldLock = this.sidenavMode() === 'over' && this.drawerActuallyOpened();
      this.document.body.style.overflow = shouldLock ? 'hidden' : '';
    });
  }

  onDrawerOpenedChange(opened: boolean) {
    this.drawerActuallyOpened.set(opened);
  }

  onSideMenuItemClicked() {
    if (this.sidenavMode() === 'over') {
      this.drawer()?.close();
    }
  }

  resetCreateEditLinkDrawer() {
    this.urlService.updateState('idToEdit', null);
    this.urlService.updateState('isCreateEditLinkDrawerOpened', false);
  }
}
