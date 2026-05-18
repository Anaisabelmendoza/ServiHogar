import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WorkerJobDetailPageRoutingModule } from './worker-job-detail-routing.module';

import { WorkerJobDetailPage } from './worker-job-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WorkerJobDetailPageRoutingModule
  ],
  declarations: [WorkerJobDetailPage]
})
export class WorkerJobDetailPageModule {}
