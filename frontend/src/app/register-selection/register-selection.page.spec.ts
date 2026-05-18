import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterSelectionPage } from './register-selection.page';

describe('RegisterSelectionPage', () => {
  let component: RegisterSelectionPage;
  let fixture: ComponentFixture<RegisterSelectionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterSelectionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
