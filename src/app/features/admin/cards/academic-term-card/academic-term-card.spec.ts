import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcademicTermCard } from './academic-term-card';

describe('AcademicTermCard', () => {
  let component: AcademicTermCard;
  let fixture: ComponentFixture<AcademicTermCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcademicTermCard],
    }).compileComponents();

    fixture = TestBed.createComponent(AcademicTermCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
