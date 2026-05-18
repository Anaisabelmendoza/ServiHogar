import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkerJobDetailPage } from './worker-job-detail.page';

describe('WorkerJobDetailPage', () => {
  let component: WorkerJobDetailPage;
  let fixture: ComponentFixture<WorkerJobDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkerJobDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
