import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WorkerWorkingPageRoutingModule } from './worker-working-routing.module';

import { WorkerWorkingPage } from './worker-working.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WorkerWorkingPageRoutingModule
  ],
  declarations: [WorkerWorkingPage]
})
export class WorkerWorkingPageModule {}
