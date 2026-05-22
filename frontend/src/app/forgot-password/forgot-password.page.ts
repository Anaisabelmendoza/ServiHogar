import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: false,
})
export class ForgotPasswordPage implements OnInit {
  email: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
  }

  async recover() {
    if (!this.email) {
      this.showAlert('Error', 'Por favor, introduce tu correo electrónico');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Enviando solicitud...',
    });
    await loading.present();

    const url = `${environment.apiUrl}/api/forgot-password`;

    this.http.post(url, {
      email: this.email
    }).subscribe({
      next: (res: any) => {
        loading.dismiss();
        this.showAlert('Éxito', 'Si el correo existe, recibirás un código de verificación.', () => {
          this.router.navigate(['/reset-password'], { queryParams: { email: this.email } });
        });
      },
      error: (err) => {
        loading.dismiss();
        const errMsg = err.error?.message || 'No se pudo procesar la solicitud en este momento.';
        this.showAlert('Error', errMsg);
      }
    });
  }

  async showAlert(header: string, message: string, callback?: Function) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            if (callback) callback();
          }
        }
      ]
    });
    await alert.present();
  }
}
