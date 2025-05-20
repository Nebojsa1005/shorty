import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEditLinkComponent } from './create-edit-link.component';

describe('CreateEditLinkComponent', () => {
  let component: CreateEditLinkComponent;
  let fixture: ComponentFixture<CreateEditLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateEditLinkComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateEditLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
