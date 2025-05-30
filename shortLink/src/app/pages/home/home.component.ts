import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterOutlet } from '@angular/router';
import { SideMenuComponent } from 'src/app/shared/components/side-menu/side-menu.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    RouterOutlet,
    SideMenuComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private breakpointObserver = inject(BreakpointObserver);

  isDrawerOpened = signal(true);

  constructor() {
    this.breakpointObserver
      .observe([Breakpoints.Small, Breakpoints.Handset])
      .subscribe((state) => {
        this.isDrawerOpened.set(!state.matches);
      });
  }
}
