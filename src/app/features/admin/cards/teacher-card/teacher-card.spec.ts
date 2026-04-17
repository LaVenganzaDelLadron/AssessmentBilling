import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherCard } from './teacher-card';

describe('TeacherCard', () => {
  let component: TeacherCard;
  let fixture: ComponentFixture<TeacherCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherCard],
    }).compileComponents();

    fixture = TestBed.createComponent(TeacherCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
