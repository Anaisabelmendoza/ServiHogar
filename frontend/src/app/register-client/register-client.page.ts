import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-register-client',
  templateUrl: './register-client.page.html',
  styleUrls: ['./register-client.page.scss'],
  standalone: false,
})
export class RegisterClientPage implements OnInit {
  step: number = 1;
  name: string = '';
  email: string = '';
  phone: string = '';
  password: string = '';
  dni: string = '';
  domicilio: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
  }

  async register() {
    if (!this.name || !this.email || !this.phone || !this.password) {
      this.showAlert('Error', 'Por favor, rellena todos los campos');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Creando cuenta...',
    });
    await loading.present();

    const url = `${environment.apiUrl}/api/register`;

    this.http.post(url, {
      role: 'cliente',
      name: this.name,
      email: this.email,
      telefono: this.phone,
      password: this.password
    }).subscribe({
      next: (res: any) => {
        loading.dismiss();
        this.showAlert('¡Bienvenido!', 'Tu cuenta de cliente ha sido creada correctamente.', () => {
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        loading.dismiss();
        console.error('Registration error:', err);
        this.showAlert('Error', 'Hubo un problema al crear la cuenta. Verifica que el correo no esté registrado.');
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
