import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfessionalSelectionPage } from './professional-selection.page';

describe('ProfessionalSelectionPage', () => {
  let component: ProfessionalSelectionPage;
  let fixture: ComponentFixture<ProfessionalSelectionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfessionalSelectionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
