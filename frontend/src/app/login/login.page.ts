import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
  }

  async login() {
    if (!this.email || !this.password) {
      this.showAlert('Error', 'Por favor, rellena todos los campos');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
    });
    await loading.present();

    const url = `${environment.apiUrl}/api/login`;

    this.http.post(url, {
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res: any) => {
        loading.dismiss();
        console.log('Login success:', res);
        
        // Guardar información del usuario y token
        localStorage.setItem('user', JSON.stringify(res.user));
        localStorage.setItem('token', res.token);
        localStorage.setItem('role', res.user.role || 'cliente');

        if (res.user.role === 'worker') {
          this.router.navigate(['/worker-home']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        loading.dismiss();
        console.error('Login error:', err);
        this.showAlert('Error', 'Credenciales incorrectas o problema de conexión con el servidor');
      }
    });
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
