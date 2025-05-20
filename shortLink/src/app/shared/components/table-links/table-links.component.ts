import { DatePipe } from '@angular/common';
import {
  Component,
  DestroyRef,
  inject,
  input,
  signal,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import {
  catchError,
  map,
  merge,
  of as observableOf,
  startWith,
  switchMap,
} from 'rxjs';
import { ToastService } from '../../../services/toast-service.service';
import { UrlService } from '../../../services/url.service';
import { UrlLink } from '../../types/url.interface';
import { CopyClipboardDirective } from '../../../directives/copy-clipboard.directive';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';

export interface ShortLink {
  shortLink: string;
  createdAt: Date;
  expirationDate: Date;
}

@Component({
  selector: 'app-table-links',
  standalone: true,
  imports: [
    MatProgressSpinnerModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    MatMenuModule,
    MatMenuTrigger,
    MatButtonModule,
    DatePipe,
    MatTooltipModule,
    CopyClipboardDirective,
  ],
  templateUrl: './table-links.component.html',
  styleUrls: ['./table-links.component.scss'],
})
export class TableLinksComponent {
  private router = inject(Router);
  private urlService = inject(UrlService);
  private destroyRef = inject(DestroyRef);

  data = input<UrlLink[]>()

  dataSource = signal<UrlLink[]>([]);

  data$ = toObservable(this.data)

  displayedColumns: string[] = ['urlName', 'shortLink', 'createdAt', 'actions'];

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.data$;
        }),
        map((data) => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.isRateLimitReached = data === null;

          if (data === null) {
            return [];
          }

          // Only refresh the result length if there is new data. In case of rate
          // limit errors, we do not want to reset the paginator to zero, as that
          // would prevent users from re-triggering requests.
          this.resultsLength = data?.length ??  0;
          return data;
        })
      )
      .subscribe((data) => this.dataSource.update(() => data ?? []));
  }

  onEdit(id: string) {
    this.router.navigate(['/edit', id]);
  }

  onDelete(id: string) {
    this.urlService
      .deleteLink(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
