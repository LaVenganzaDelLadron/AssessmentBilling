import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { StudentScholarships } from './student-scholarships';
import { StudentScholarshipsService } from '../../services/student-scholarships.service';

describe('StudentScholarships', () => {
  let component: StudentScholarships;
  let fixture: ComponentFixture<StudentScholarships>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentScholarships],
      providers: [
        {
          provide: StudentScholarshipsService,
          useValue: {
            list: () => of([]),
            setCachedStudentScholarships: () => undefined
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentScholarships);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
