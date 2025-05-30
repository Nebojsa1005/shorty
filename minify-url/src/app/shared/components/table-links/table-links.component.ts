import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { PopoverController } from '@ionic/angular/standalone';
import {
  ColumnDef,
  createAngularTable,
  FlexRenderDirective,
  getCoreRowModel,
  getPaginationRowModel,
  RowSelectionState,
} from '@tanstack/angular-table';
import { ionIcons } from '../../../../icons';
import { CopyClipboardDirective } from '../../../directives/copy-clipboard.directive';
import { UrlService } from '../../../services/url.service';
import { CopyClipboardPopoverComponent } from '../copy-clipboard-popover/copy-clipboard-popover.component';

interface CellDef {
  accessorKey: string;
  cell: (info: any) => { data: string; columnId: string };
  header: string;
  id: string;
}

@Component({
  selector: 'app-table-links',
  templateUrl: './table-links.component.html',
  styleUrls: ['./table-links.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    FlexRenderDirective,
    CommonModule,
    CopyClipboardDirective,
    CopyClipboardPopoverComponent,
  ],
})
export class TableLinksComponent {
  private router = inject(Router);
  private urlService = inject(UrlService);
  private destroyRef = inject(DestroyRef);
  private popoverController = inject(PopoverController);

  data = input<any>();

  rowSelection = signal<RowSelectionState>({});
  pagination = signal({
    pageIndex: 0,
    pageSize: 2,
  });

  icons = ionIcons;
  defaultColumns: ColumnDef<CellDef>[] = [
    {
      accessorKey: 'urlName',
      cell: (info: any) => ({ data: info.getValue(), columnId: 'urlName' }),
      header: 'Name',
      id: 'urlName',
    },
    {
      accessorKey: 'shortLink',
      cell: (info) => ({ data: info.getValue(), columnId: 'shortLink' }),
      id: 'shortLink',
      header: 'Minified URL',
    },
    {
      accessorKey: 'expirationDate',
      cell: (info) => ({ data: info.getValue(), columnId: 'expirationDate' }),

      id: 'expirationDate',
      header: 'Expiration Date',
    },
    {
      accessorKey: 'createdAt',
      cell: (info) => ({ data: info.getValue(), columnId: 'createdAt' }),
      header: 'Created',
      id: 'createdAt',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (info) => ({ data: info.row, columnId: 'actions' }), // Pass the whole row object for actions
    },
  ];

  table = createAngularTable(() => ({
    data: this.data() ?? [],
    columns: this.defaultColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,

    onRowSelectionChange: (updaterOrValue) => {
      this.rowSelection.set(
        typeof updaterOrValue === 'function'
          ? updaterOrValue(this.rowSelection())
          : updaterOrValue
      );
    },

    onPaginationChange: (updaterOrValue) => {
      this.pagination.set(
        typeof updaterOrValue === 'function'
          ? updaterOrValue(this.pagination())
          : updaterOrValue
      );
    },

    state: {
      rowSelection: this.rowSelection(),
      pagination: this.pagination(),
    },
  }));

  onEdit(cell: any) {
    this.router.navigate(['/edit', cell.data.original._id]);
  }

  onDelete(cell: any) {
    this.urlService
      .deleteLink(cell.data.original._id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  async presentPopover(e: Event) {
    const popover = await this.popoverController.create({
      component: CopyClipboardPopoverComponent,
      event: e,
      showBackdrop: false,
      animated: true,
      arrow: true,
      mode: 'ios',
      side: 'bottom',
      alignment: 'start',
    });

    await popover.present();

    setTimeout(() => {
      popover.dismiss();
    }, 3000);
  }
}
