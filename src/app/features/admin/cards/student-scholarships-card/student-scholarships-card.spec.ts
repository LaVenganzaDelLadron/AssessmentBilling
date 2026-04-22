import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentScholarshipsCard } from './student-scholarships-card';

describe('StudentScholarshipsCard', () => {
  let component: StudentScholarshipsCard;
  let fixture: ComponentFixture<StudentScholarshipsCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentScholarshipsCard],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentScholarshipsCard);
    component = fixture.componentInstance;
    component.record = {
      id: 1,
      student_id: 3,
      scholarship_id: 5,
      discount_type: 'percent',
      discount_value: 25,
      original_amount: 10000,
      discount_amount: 2500,
      final_amount: 7500,
      applied_at: '2026-04-22T00:00:00Z',
      created_at: '2026-04-22T00:00:00Z',
      updated_at: '2026-04-22T00:00:00Z',
      student: {
        id: 3,
        student_no: '2024-0003',
        first_name: 'Alex',
        last_name: 'Reyes'
      },
      scholarship: {
        id: 5,
        name: 'Academic Excellence'
      }
    };
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
