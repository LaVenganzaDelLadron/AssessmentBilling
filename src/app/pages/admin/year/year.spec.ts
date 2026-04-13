import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Year } from './year';

describe('Year', () => {
  let component: Year;
  let fixture: ComponentFixture<Year>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Year],
    }).compileComponents();

    fixture = TestBed.createComponent(Year);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
