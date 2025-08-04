import { DatePipe } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  effect,
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
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import {
  catchError,
  map,
  merge,
  of as observableOf,
  of,
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
  private route = inject(ActivatedRoute);
  private urlService = inject(UrlService);
  private destroyRef = inject(DestroyRef);

  data = input<UrlLink[]>();
  tableLoading = input<boolean>(false);

  dataSource: MatTableDataSource<UrlLink>;

  data$ = toObservable(this.data);

  displayedColumns = ['urlName', 'shortLink', 'createdAt', 'actions'];

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    this.dataSource = new MatTableDataSource<UrlLink>(this.data() || []);
    effect(() => {
      this.dataSource = new MatTableDataSource<UrlLink>(this.data() || []);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  onEdit(id: string) {
    this.urlService.updateState('isCreateEditLinkDrawerOpened', true)
    this.urlService.updateState('idToEdit', id)
  }

  onDelete(id: string) {
    this.urlService
      .deleteLink(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
