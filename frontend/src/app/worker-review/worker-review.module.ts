import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WorkerReviewPageRoutingModule } from './worker-review-routing.module';

import { WorkerReviewPage } from './worker-review.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WorkerReviewPageRoutingModule
  ],
  declarations: [WorkerReviewPage]
})
export class WorkerReviewPageModule {}
