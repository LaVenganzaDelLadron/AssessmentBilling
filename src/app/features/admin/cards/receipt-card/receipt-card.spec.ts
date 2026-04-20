import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiptCard } from './receipt-card';

describe('ReceiptCard', () => {
  let component: ReceiptCard;
  let fixture: ComponentFixture<ReceiptCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceiptCard],
    }).compileComponents();

    fixture = TestBed.createComponent(ReceiptCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
