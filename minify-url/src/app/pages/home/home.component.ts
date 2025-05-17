import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { ionIcons } from '../../../icons';
import { TableSearchPipe } from '../../pipes/table-search.pipe';
import { UrlService } from '../../services/url.service';
import { TableLinksComponent } from '../../shared/components/table-links/table-links.component';

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
  private router = inject(Router);

  searchControl = new FormControl<string>('');
  icons = ionIcons;

  searchControlValueChanges$ = this.searchControl.valueChanges.pipe(
    debounceTime(300),
    distinctUntilChanged(),
  );

  allUrls = computed(() => this.homeService.allUrls());

  ngOnInit() {
    this.homeService
      .fetchAllUrls()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((e) => console.log(e));
  }

  ionViewDidLeave() {
    this.searchControl.reset();
  }

  newLink() {
    this.router.navigate(['new']);
  }
}
