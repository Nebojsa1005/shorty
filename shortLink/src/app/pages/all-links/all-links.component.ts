import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { UrlService } from '../../services/url.service';
import { TableLinksComponent } from '../../shared/components/table-links/table-links.component';

@Component({
    selector: 'app-all-links',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        TableLinksComponent,
    ],
    templateUrl: './all-links.component.html',
    styleUrl: './all-links.component.scss'
})
export class AllLinksComponent {
  private destroyRef = inject(DestroyRef);
  private urlService = inject(UrlService);
  private router = inject(Router);

  tableLoading = computed(() => this.urlService.allUrlsLoading());
  allUrls = computed(() => this.urlService.allUrls());

  searchControl = new FormControl<string>('');

  searchControlValueChanges$ = this.searchControl.valueChanges.pipe(
    debounceTime(300),
    distinctUntilChanged()
  );

  ngOnInit() {
    this.urlService.updateState('allUrlsLoading', true);
    this.urlService
      .fetchAllUrls()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.urlService.updateState('allUrlsLoading', false));
  }

  ionViewDidLeave() {
    this.searchControl.reset();
  }

  newLink() {
    this.router.navigate(['']);
  }
}
