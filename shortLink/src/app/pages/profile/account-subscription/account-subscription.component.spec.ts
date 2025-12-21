import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountSubscriptionComponent } from './account-subscription.component';

describe('AccountSubscriptionComponent', () => {
  let component: AccountSubscriptionComponent;
  let fixture: ComponentFixture<AccountSubscriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountSubscriptionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountSubscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
