import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherSubject } from './teacher-subject';

describe('TeacherSubject', () => {
  let component: TeacherSubject;
  let fixture: ComponentFixture<TeacherSubject>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherSubject],
    }).compileComponents();

    fixture = TestBed.createComponent(TeacherSubject);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
