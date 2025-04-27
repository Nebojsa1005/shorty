import { DatePipe } from '@angular/common';
import { Component, effect, inject, input, OnInit, signal } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ColumnDef, createAngularTable, FlexRenderDirective, getCoreRowModel } from '@tanstack/angular-table';

@Component({
  selector: 'app-table-links',
  templateUrl: './table-links.component.html',
  styleUrls: ['./table-links.component.scss'],
  standalone: true,
  imports: [IonicModule, FlexRenderDirective],
  providers: [DatePipe]
})
export class TableLinksComponent {
  private datePipe = inject(DatePipe)

  data = input<any>()

  defaultColumns: ColumnDef<any>[] = [
    {
      accessorKey: 'name',
      cell: info => info.getValue(),
      header: 'Name',
      id: 'name'
    },
    {
      accessorFn: (row) => row.shortUrl,
      cell: info => `<a href="${info.getValue()}" target="_blank">${info.getValue()}</a>`,
      accessorKey: 'shortURL',
      id: 'shortURL',
      header: 'Minified URL',
    },
    {
      accessorKey: 'createdAt',
      cell: info => this.datePipe.transform(info.getValue() as string, 'mediumDate'),
      header: 'Created',
      id: 'createdAt'
    }
  ]

  table = createAngularTable(() => ({
    data: this.data() ?? [],
    columns: this.defaultColumns,
    getCoreRowModel: getCoreRowModel(),
    debugTable: true,
  }))

  constructor() {
    effect(() => console.log(this.data()))
  }
}
