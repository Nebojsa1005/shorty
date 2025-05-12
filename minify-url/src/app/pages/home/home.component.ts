import { Component, computed, DestroyRef, effect, inject, OnDestroy, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TableLinksComponent } from '../../shared/components/table-links/table-links.component';
import { UrlService } from '../services/url.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TableSearchPipe } from '../../pipes/table-search.pipe';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ionIcons } from '../../../icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    IonicModule,
    TableLinksComponent,
    ReactiveFormsModule,
    TableSearchPipe,
    CommonModule,
  ],
})
export class HomeComponent implements OnInit {
  private homeService = inject(UrlService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router)

  searchControl = new FormControl('');
  icons = ionIcons

  searchControlValueChanges$ = this.searchControl.valueChanges.pipe(
    debounceTime(300),
    distinctUntilChanged()
  );

  allUrls = computed(() => this.homeService.allUrls());

  ngOnInit() {
    this.homeService
      .fetchAllUrls()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((e) => console.log(e));
  }

  ionViewDidLeave() {
    this.searchControl.reset()
  }

  newLink() {
    this.router.navigate(['url', 'new'])
  }
}
