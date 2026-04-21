import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssessmentBreakdownCard } from './assessment-breakdown-card';

describe('AssessmentBreakdownCard', () => {
  let component: AssessmentBreakdownCard;
  let fixture: ComponentFixture<AssessmentBreakdownCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentBreakdownCard]
    }).compileComponents();

    fixture = TestBed.createComponent(AssessmentBreakdownCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

