import { DatePipe } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import {
  MatPaginator,
  MatPaginatorModule
} from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTooltip } from '@angular/material/tooltip';
import { CopyClipboardDirective } from '../../../directives/copy-clipboard.directive';
import { UrlService } from '../../../services/url.service';
import { UrlLink } from '../../types/url.interface';

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
  private urlService = inject(UrlService);
  private destroyRef = inject(DestroyRef);
  
  paginator = viewChild(MatPaginator)
  sort = viewChild(MatSort)

  data = input.required<UrlLink[]>();
  tableLoading = input<boolean>(false);
  // table state (signals)
  total = computed(() => this.data()?.length ?? 0);

  dataSource = new MatTableDataSource<UrlLink>([])
  displayedColumns = ['urlName', 'shortLink', 'createdAt', 'actions'];
  
  constructor() {
    // keep one dataSource; just replace its data when input changes
    effect(() => {
      this.dataSource.data = this.data() ?? [];
    });

    // attach paginator/sort when they exist
    effect(() => {
      const p = this.paginator();
      if (p && this.dataSource.paginator !== p) this.dataSource.paginator = p;

      const s = this.sort();
      if (s && this.dataSource.sort !== s) this.dataSource.sort = s;
    });
  }

  private tooltipTimers = new WeakMap<MatTooltip, any>();

  onCopy(tooltip: MatTooltip) {
    try {
      // show temporary 'Copied!' message
      tooltip.message = 'Copied!';
      tooltip.show();

      // clear any existing timer for this tooltip
      const existing = this.tooltipTimers.get(tooltip);
      if (existing) clearTimeout(existing);

      const t = setTimeout(() => {
        try {
          tooltip.hide();
          tooltip.message = 'Copy';
        } catch (e) {}
        this.tooltipTimers.delete(tooltip);
      }, 1200);

      this.tooltipTimers.set(tooltip, t);
    } catch (e) {
      // ignore errors silently
    }
  }

  onEdit(id: string) {
    this.urlService.updateState('isCreateEditLinkDrawerOpened', true);
    this.urlService.updateState('idToEdit', id);
  }

  onDelete(id: string) {
    this.urlService
      .deleteLink(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
