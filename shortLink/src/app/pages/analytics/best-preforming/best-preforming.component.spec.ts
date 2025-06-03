import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BestPreformingComponent } from './best-preforming.component';

describe('BestPreformingComponent', () => {
  let component: BestPreformingComponent;
  let fixture: ComponentFixture<BestPreformingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BestPreformingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BestPreformingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
