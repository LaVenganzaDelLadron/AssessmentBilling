import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnrollmentCard } from './enrollment-card';

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
});
