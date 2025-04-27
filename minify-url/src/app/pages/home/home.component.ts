import { Component, computed, effect, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TableLinksComponent } from '../../shared/components/table-links/table-links.component';
import { HomeService } from '../services/home.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [IonicModule, TableLinksComponent],
})
export class HomeComponent {
  private homeService = inject(HomeService);

  allUrls = computed(() => this.homeService.allUrls());

  constructor() {
    this.homeService.fetchAllUrls().pipe(takeUntilDestroyed()).subscribe(e => console.log(e));
  }
}
