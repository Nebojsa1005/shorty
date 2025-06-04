import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSpanComponent } from './time-span.component';

describe('TimeSpanComponent', () => {
  let component: TimeSpanComponent;
  let fixture: ComponentFixture<TimeSpanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeSpanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeSpanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
