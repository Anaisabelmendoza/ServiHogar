import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ServiceTrackingPageRoutingModule } from './service-tracking-routing.module';

import { ServiceTrackingPage } from './service-tracking.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ServiceTrackingPageRoutingModule
  ],
  declarations: [ServiceTrackingPage]
})
export class ServiceTrackingPageModule {}
