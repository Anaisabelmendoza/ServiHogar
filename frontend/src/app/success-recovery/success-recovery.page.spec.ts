import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SuccessRecoveryPage } from './success-recovery.page';

describe('SuccessRecoveryPage', () => {
  let component: SuccessRecoveryPage;
  let fixture: ComponentFixture<SuccessRecoveryPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SuccessRecoveryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
