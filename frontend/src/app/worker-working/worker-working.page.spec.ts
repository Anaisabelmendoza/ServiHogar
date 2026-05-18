import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkerWorkingPage } from './worker-working.page';

describe('WorkerWorkingPage', () => {
  let component: WorkerWorkingPage;
  let fixture: ComponentFixture<WorkerWorkingPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkerWorkingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
