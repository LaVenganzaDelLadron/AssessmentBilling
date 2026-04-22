import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogCard } from './log-card';

describe('LogCard', () => {
  let component: LogCard;
  let fixture: ComponentFixture<LogCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogCard],
    }).compileComponents();

    fixture = TestBed.createComponent(LogCard);
    component = fixture.componentInstance;
    component.log = {
      id: 1,
      user_id: 7,
      action: 'create',
      entity_type: 'Invoice',
      entity_id: '101',
      ip_address: '127.0.0.1',
      created_at: '2026-04-22T08:00:00Z',
      updated_at: '2026-04-22T08:00:00Z',
    };
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
