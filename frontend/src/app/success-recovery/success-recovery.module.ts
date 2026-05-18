import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SuccessRecoveryPageRoutingModule } from './success-recovery-routing.module';

import { SuccessRecoveryPage } from './success-recovery.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SuccessRecoveryPageRoutingModule
  ],
  declarations: [SuccessRecoveryPage]
})
export class SuccessRecoveryPageModule {}
