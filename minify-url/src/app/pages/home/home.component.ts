import { Component, computed, DestroyRef, effect, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TableLinksComponent } from '../../shared/components/table-links/table-links.component';
import { UrlService } from '../services/url.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [IonicModule, TableLinksComponent],
})
export class HomeComponent {
  private homeService = inject(UrlService);
  private destroyRef = inject(DestroyRef)

  allUrls = computed(() => this.homeService.allUrls());

  ngOnInit() {
    this.homeService
      .fetchAllUrls()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((e) => console.log(e));
  }
}
