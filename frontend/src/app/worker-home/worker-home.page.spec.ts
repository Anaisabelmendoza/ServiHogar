import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkerHomePage } from './worker-home.page';

describe('WorkerHomePage', () => {
  let component: WorkerHomePage;
  let fixture: ComponentFixture<WorkerHomePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkerHomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
