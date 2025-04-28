import { CommonModule } from '@angular/common';
import { Component, input, signal } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import {
  ColumnDef,
  createAngularTable,
  flexRenderComponent,
  FlexRenderDirective,
  getCoreRowModel,
  RowSelectionState,
} from '@tanstack/angular-table';
import { NgxTippyModule } from 'ngx-tippy-wrapper';
import {
  TableHeadSelectionComponent,
  TableRowSelectionComponent,
} from '../selection-column/selection-column.component';
import { ionIcons } from '../../../../icons';

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
  imports: [IonicModule, FlexRenderDirective, NgxTippyModule, CommonModule],
})
export class TableLinksComponent {
  data = input<any>();

  rowSelection = signal<RowSelectionState>({});

  icons = ionIcons
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
    debugTable: true,
  }));

  onEdit(cell: any) {
    console.log(cell)
  }

  onDelete(cell: any) {
    console.log(cell)
  }
}
