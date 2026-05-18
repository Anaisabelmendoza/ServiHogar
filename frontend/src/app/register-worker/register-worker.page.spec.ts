import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterWorkerPage } from './register-worker.page';

describe('RegisterWorkerPage', () => {
  let component: RegisterWorkerPage;
  let fixture: ComponentFixture<RegisterWorkerPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterWorkerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
