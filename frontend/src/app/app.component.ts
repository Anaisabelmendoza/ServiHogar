import { Component } from '@angular/core';
import { PushNotificationService } from './services/push-notification.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(private pushService: PushNotificationService) {
    this.initializeApp();
  }

  initializeApp() {
    // Inicializar servicio de notificaciones push
    this.pushService.initialize();
  }
}
