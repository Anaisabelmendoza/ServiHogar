import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegisterWorkerPageRoutingModule } from './register-worker-routing.module';

import { RegisterWorkerPage } from './register-worker.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegisterWorkerPageRoutingModule
  ],
  declarations: [RegisterWorkerPage]
})
export class RegisterWorkerPageModule {}
