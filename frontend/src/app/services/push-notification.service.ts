import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

// Detecta si Capacitor está disponible (app nativa) o no (navegador web)
declare const Capacitor: any;

export interface PushNotificationPayload {
  title?: string;
  body?: string;
  data?: any;
}

/**
 * PushNotificationService
 * -----------------------
 * Gestiona las notificaciones push via Firebase Cloud Messaging (FCM)
 * a través del plugin @capacitor/push-notifications.
 *
 * CONFIGURACIÓN REQUERIDA:
 * 1. Crear proyecto en https://console.firebase.google.com
 * 2. Añadir app Android/iOS al proyecto Firebase
 * 3. Descargar google-services.json (Android) y/o GoogleService-Info.plist (iOS)
 * 4. Colocar google-services.json en /frontend/android/app/
 * 5. Ejecutar: npx cap add android && npx cap sync
 * 6. En el backend: usar el FCM token para enviar notificaciones push
 */
@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {

  private fcmToken: string | null = null;

  constructor(private router: Router) {}

  /**
   * Inicializa el servicio de notificaciones push.
   * Debe llamarse desde app.component.ts al arrancar la app.
   */
  async initialize(): Promise<void> {
    // Solo funciona en app nativa (Android/iOS), no en navegador
    if (typeof Capacitor === 'undefined' || !Capacitor.isNativePlatform()) {
      console.log('[PushNotifications] Plataforma web detectada, notificaciones push deshabilitadas.');
      return;
    }

    try {
      // Importación dinámica para evitar errores en navegador
      const { PushNotifications } = await import('@capacitor/push-notifications');

      // 1. Solicitar permisos
      const permission = await PushNotifications.requestPermissions();
      if (permission.receive !== 'granted') {
        console.warn('[PushNotifications] El usuario rechazó los permisos de notificación.');
        return;
      }

      // 2. Registrar en FCM
      await PushNotifications.register();

      // 3. Escuchar el token FCM (se actualiza cada vez que inicia la app)
      PushNotifications.addListener('registration', async (token) => {
        this.fcmToken = token.value;
        console.log('[PushNotifications] FCM Token obtenido:', token.value);
        // Enviar el token al backend para guardarlo en el usuario
        await this.sendTokenToBackend(token.value);
      });

      // 4. Error de registro
      PushNotifications.addListener('registrationError', (error) => {
        console.error('[PushNotifications] Error de registro:', error);
      });

      // 5. Notificación recibida con la app ABIERTA (foreground)
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('[PushNotifications] Notificación recibida en foreground:', notification);
        // Aquí podrías mostrar un toast o banner personalizado
        this.handleNotification(notification.data);
      });

      // 6. Usuario pulsa la notificación (app en background o cerrada)
      PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        console.log('[PushNotifications] Usuario pulsó la notificación:', action);
        this.handleNotification(action.notification.data);
      });

    } catch (error) {
      console.error('[PushNotifications] Error al inicializar:', error);
    }
  }

  /**
   * Envía el token FCM al backend para guardarlo en el perfil del usuario.
   * El backend usará este token para enviar notificaciones a este dispositivo.
   */
  private async sendTokenToBackend(token: string): Promise<void> {
    const authToken = localStorage.getItem('token');
    if (!authToken) return;

    try {
      // Importar el environment dinámicamente
      const { environment } = await import('../../environments/environment');

      await fetch(`${environment.apiUrl}/api/user/fcm-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ fcm_token: token })
      });
      console.log('[PushNotifications] Token FCM enviado al backend correctamente.');
    } catch (error) {
      console.error('[PushNotifications] Error al enviar token al backend:', error);
    }
  }

  /**
   * Maneja la navegación cuando se pulsa una notificación.
   */
  private handleNotification(data: any): void {
    if (!data) return;

    const role = localStorage.getItem('role');

    // Navegar según el tipo de notificación
    if (data.type === 'new_request' && role === 'worker') {
      this.router.navigate(['/worker-home']);
    } else if (data.type === 'request_accepted' && (role === 'cliente' || role === 'client')) {
      this.router.navigate(['/appointments-history']);
    } else if (data.type === 'worker_started' && (role === 'cliente' || role === 'client')) {
      if (data.request_id) {
        this.router.navigate(['/service-tracking'], { queryParams: { id: data.request_id } });
      }
    }
  }

  /**
   * Devuelve el token FCM del dispositivo actual.
   */
  getToken(): string | null {
    return this.fcmToken;
  }
}
