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
  confirmPassword: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  dni: string = '';
  domicilio: string = '';
  codigo_postal: string = '';
  ciudad: string = '';
  provincia: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
  }

  isPasswordValid(pass: string): boolean {
    if (!pass) return true;
    const hasUpper = /[A-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSign = /[!@#$%^&*(),.?":{}|<>\-_]/.test(pass);
    return hasUpper && hasNumber && hasSign;
  }

  async register() {
    if (!this.name || !this.email || !this.phone || !this.password || !this.domicilio || !this.codigo_postal || !this.ciudad || !this.provincia) {
      this.showAlert('Error', 'Por favor, rellena todos los campos');
      return;
    }

    if (!this.isPasswordValid(this.password)) {
      this.showAlert('Error', 'La contraseña no cumple con los requisitos de seguridad');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.showAlert('Error', 'Las contraseñas no coinciden');
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
      password: this.password,
      domicilio: this.domicilio,
      codigo_postal: this.codigo_postal,
      ciudad: this.ciudad,
      provincia: this.provincia
    }).subscribe({
      next: (res: any) => {
        loading.dismiss();
        this.showAlert('¡Bienvenid@!', 'Tu cuenta de cliente ha sido creada correctamente.', () => {
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
