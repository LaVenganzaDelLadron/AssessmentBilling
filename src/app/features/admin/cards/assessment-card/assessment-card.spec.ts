import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentCard } from './assessment-card';

describe('AssessmentCard', () => {
  let component: AssessmentCard;
  let fixture: ComponentFixture<AssessmentCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentCard],
    }).compileComponents();

    fixture = TestBed.createComponent(AssessmentCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
