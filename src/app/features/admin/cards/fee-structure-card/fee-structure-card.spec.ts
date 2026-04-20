import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeeStructureCard } from './fee-structure-card';

describe('FeeStructureCard', () => {
  let component: FeeStructureCard;
  let fixture: ComponentFixture<FeeStructureCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeeStructureCard],
    }).compileComponents();

    fixture = TestBed.createComponent(FeeStructureCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
