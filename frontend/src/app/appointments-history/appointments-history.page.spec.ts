import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentsHistoryPage } from './appointments-history.page';

describe('AppointmentsHistoryPage', () => {
  let component: AppointmentsHistoryPage;
  let fixture: ComponentFixture<AppointmentsHistoryPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AppointmentsHistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
