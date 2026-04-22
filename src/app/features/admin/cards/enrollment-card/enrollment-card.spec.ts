import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnrollmentCard } from './enrollment-card';
import { Enrollment } from '../../models/enrollment.model';

describe('EnrollmentCard', () => {
  let component: EnrollmentCard;
  let fixture: ComponentFixture<EnrollmentCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnrollmentCard],
    }).compileComponents();

    fixture = TestBed.createComponent(EnrollmentCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('allows managing an enrollment with a valid id', () => {
    component.enrollment = createEnrollment({ id: 12 });

    expect(component.canManageEnrollment()).toBeTrue();
  });

  it('temporarily allows managing an enrollment without an id when linked data exists', () => {
    component.enrollment = createEnrollment({ id: null, student_id: 8 });

    expect(component.canManageEnrollment()).toBeTrue();
  });

  it('blocks managing an enrollment with no identifying data', () => {
    component.enrollment = createEnrollment({
      id: null,
      student_id: null,
      subject_id: null,
      academic_term_id: null
    });

    expect(component.canManageEnrollment()).toBeFalse();
  });
});

function createEnrollment(overrides: Partial<Enrollment> = {}): Enrollment {
  return {
    id: 1,
    student_id: 1,
    subject_id: 1,
    academic_term_id: 1,
    semester: '1st Semester',
    school_year: '2025-2026',
    status: 'enrolled',
    created_at: null,
    updated_at: null,
    ...overrides
  };
}
