import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WorkerHomePageRoutingModule } from './worker-home-routing.module';

import { WorkerHomePage } from './worker-home.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WorkerHomePageRoutingModule
  ],
  declarations: [WorkerHomePage]
})
export class WorkerHomePageModule {}
