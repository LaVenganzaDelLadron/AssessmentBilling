import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoicesCard } from './invoices-card';

describe('InvoicesCard', () => {
  let component: InvoicesCard;
  let fixture: ComponentFixture<InvoicesCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoicesCard],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoicesCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
