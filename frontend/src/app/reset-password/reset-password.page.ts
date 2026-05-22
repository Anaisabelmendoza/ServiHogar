import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: false,
})
export class ResetPasswordPage implements OnInit {
  email: string = '';
  code: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
    });
  }

  async resetPassword() {
    if (!this.code || !this.newPassword || !this.confirmPassword) {
      this.showAlert('Error', 'Por favor, rellena todos los campos');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.showAlert('Error', 'Las contraseñas no coinciden');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Actualizando contraseña...',
    });
    await loading.present();

    const url = `${environment.apiUrl}/api/reset-password`;

    this.http.post(url, {
      email: this.email,
      code: this.code,
      password: this.newPassword
    }).subscribe({
      next: (res: any) => {
        loading.dismiss();
        this.showAlert('Éxito', 'Contraseña actualizada correctamente.', () => {
          this.router.navigate(['/success-recovery']);
        });
      },
      error: (err) => {
        loading.dismiss();
        const errMsg = err.error?.message || 'El código de verificación es incorrecto o ha expirado.';
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
