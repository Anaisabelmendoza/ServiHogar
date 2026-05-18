import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkerReviewPage } from './worker-review.page';

describe('WorkerReviewPage', () => {
  let component: WorkerReviewPage;
  let fixture: ComponentFixture<WorkerReviewPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkerReviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
