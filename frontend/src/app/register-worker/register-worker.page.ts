import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-register-worker',
  templateUrl: './register-worker.page.html',
  styleUrls: ['./register-worker.page.scss'],
  standalone: false,
})
export class RegisterWorkerPage implements OnInit {
  step: number = 1;
  name: string = '';
  last_name: string = '';
  dni: string = '';
  email: string = '';
  profession: string = 'electricista';
  phone: string = '';
  password: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
  }

  async register() {
    if (!this.name || !this.email || !this.profession || !this.phone || !this.password) {
      this.showAlert('Error', 'Por favor, rellena todos los campos');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Creando cuenta profesional...',
    });
    await loading.present();

    const url = `${environment.apiUrl}/api/register`;

    this.http.post(url, {
      role: 'worker',
      name: this.name,
      email: this.email,
      profesion: this.profession,
      telefono: this.phone,
      password: this.password,
      apellidos: this.last_name
    }).subscribe({
      next: (res: any) => {
        loading.dismiss();
        this.showAlert('¡Bienvenido!', 'Tu cuenta de profesional ha sido creada correctamente.', () => {
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
