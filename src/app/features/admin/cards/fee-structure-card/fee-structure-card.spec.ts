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
    component.fee = {
      id: 1,
      program_id: 1,
      program_name: 'Bachelor of Science in Information Technology',
      fee_type: 'tuition',
      amount: 450,
      per_unit: true,
      created_at: '2026-04-22T00:00:00Z',
      updated_at: '2026-04-22T00:00:00Z'
    };
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
