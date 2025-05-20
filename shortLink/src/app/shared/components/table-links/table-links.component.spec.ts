import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableLinksComponent } from './table-links.component';

describe('TableLinksComponent', () => {
  let component: TableLinksComponent;
  let fixture: ComponentFixture<TableLinksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableLinksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableLinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
