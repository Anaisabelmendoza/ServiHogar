import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServiceDescriptionPage } from './service-description.page';

describe('ServiceDescriptionPage', () => {
  let component: ServiceDescriptionPage;
  let fixture: ComponentFixture<ServiceDescriptionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceDescriptionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
