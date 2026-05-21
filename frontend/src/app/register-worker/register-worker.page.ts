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
  professions: string[] = ['electricista'];
  phone: string = '';
  password: string = '';
  confirmPassword: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
  }

  toggleProfession(prof: string) {
    const index = this.professions.indexOf(prof);
    if (index > -1) {
      this.professions.splice(index, 1);
    } else {
      this.professions.push(prof);
    }
  }

  hasProfession(prof: string): boolean {
    return this.professions.includes(prof);
  }

  isPasswordValid(pass: string): boolean {
    if (!pass) return true;
    const hasUpper = /[A-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSign = /[!@#$%^&*(),.?":{}|<>\-_]/.test(pass);
    return hasUpper && hasNumber && hasSign;
  }

  async register() {
    if (!this.name || !this.email || this.professions.length === 0 || !this.phone || !this.password) {
      this.showAlert('Error', 'Por favor, rellena todos los campos y elige al menos una profesión');
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
      message: 'Creando cuenta profesional...',
    });
    await loading.present();

    const url = `${environment.apiUrl}/api/register`;

    this.http.post(url, {
      role: 'worker',
      name: this.name,
      email: this.email,
      profesion: this.professions.join(', '),
      telefono: this.phone,
      password: this.password,
      apellidos: this.last_name
    }).subscribe({
      next: (res: any) => {
        loading.dismiss();
        this.showAlert('¡Bienvenid@!', 'Tu cuenta de profesional ha sido creada correctamente.', () => {
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
