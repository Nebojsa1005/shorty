import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import {
  ColumnDef,
  createAngularTable,
  flexRenderComponent,
  FlexRenderDirective,
  getCoreRowModel,
  RowSelectionState,
} from '@tanstack/angular-table';
import {
  TableHeadSelectionComponent,
  TableRowSelectionComponent,
} from '../selection-column/selection-column.component';
import { ionIcons } from '../../../../icons';
import { Router } from '@angular/router';
import { UrlService } from '../../../pages/services/url.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CopyClipboardDirective } from '../../../directives/copy-clipboard.directive';
import { PopoverController } from '@ionic/angular/standalone';
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
  imports: [IonicModule, FlexRenderDirective, CommonModule, CopyClipboardDirective, CopyClipboardPopoverComponent],
})
export class TableLinksComponent {
  private router = inject(Router);
  private urlService = inject(UrlService);
  private destroyRef = inject(DestroyRef)
  private popoverController = inject(PopoverController)

  data = input<any>();

  rowSelection = signal<RowSelectionState>({});

  icons = ionIcons;
  defaultColumns: ColumnDef<CellDef>[] = [
    {
      id: 'select',
      header: () => {
        return flexRenderComponent(TableHeadSelectionComponent);
      },
      cell: () => {
        return flexRenderComponent(TableRowSelectionComponent);
      },
    },
    {
      accessorKey: 'urlName',
      cell: (info: any) => ({ data: info.getValue(), columnId: 'urlName' }),
      header: 'Name',
      id: 'urlName',
    },
    {
      accessorKey: 'shortUrl',
      cell: (info) => ({ data: info.getValue(), columnId: 'shortURL' }),
      id: 'shortURL',
      header: 'Minified URL',
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
    enableRowSelection: true,
    onRowSelectionChange: (updaterOrValue) => {
      this.rowSelection.set(
        typeof updaterOrValue === 'function'
          ? updaterOrValue(this.rowSelection())
          : updaterOrValue
      );
    },
    state: {
      rowSelection: this.rowSelection(),
    },
  }));

  onEdit(cell: any) {
    this.router.navigate(['/url/edit', cell.data.original._id]);
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
      alignment: 'start'
    });

    await popover.present();

    setTimeout(() => {
      popover.dismiss()
    }, 3000)


  }
}
