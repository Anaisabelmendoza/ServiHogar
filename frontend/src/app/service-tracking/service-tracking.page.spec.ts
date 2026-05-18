import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServiceTrackingPage } from './service-tracking.page';

describe('ServiceTrackingPage', () => {
  let component: ServiceTrackingPage;
  let fixture: ComponentFixture<ServiceTrackingPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceTrackingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
