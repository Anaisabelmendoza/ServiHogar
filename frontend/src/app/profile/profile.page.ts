import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AlertController, LoadingController } from '@ionic/angular';
import { timeout } from 'rxjs/operators';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {
  userName: string = 'Usuario';
  nombre: string = '';
  apellidos: string = '';
  telefono: string = '';
  email: string = '';
  profesion: string = '';
  avatarUrl: string | null = null;
  urgencyPrice: number = 10;
  isEditing: boolean = false;
  isWorker: boolean = false;

  selectedProfessions: string[] = [];
  availableProfessions = [
    { value: 'electricista', label: 'Electricista' },
    { value: 'carpintero', label: 'Carpintero' },
    { value: 'pintor', label: 'Pintor' },
    { value: 'fontanero', label: 'Fontanero' },
    { value: 'obrero', label: 'Obrero' },
    { value: 'cerrajero', label: 'Cerrajero' }
  ];

  constructor(
    private router: Router,
    private http: HttpClient,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    const role = localStorage.getItem('role');
    this.isWorker = (role === 'worker');

    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.userName = user.name || 'Usuario';
      this.nombre = user.name || '';
      this.apellidos = user.apellidos || '';
      this.telefono = user.telefono || '600-000-000';
      this.email = user.email || '';
      this.profesion = user.profesion || 'fontanero';
      this.avatarUrl = user.avatarUrl || null;
      this.urgencyPrice = user.urgency_price !== undefined ? parseFloat(user.urgency_price) : 10;

      // Convertir de string a array para el selector multiselección
      if (this.profesion) {
        this.selectedProfessions = this.profesion.split(',')
          .map(p => p.trim().toLowerCase())
          .filter(p => p.length > 0);
      } else {
        this.selectedProfessions = ['fontanero'];
      }
    } else {
      // Valores por defecto
      this.nombre = 'Usuario';
      this.apellidos = 'ServiHogar';
      this.telefono = '600-000-000';
      this.email = 'usuario@servihogar.com';
      this.profesion = 'fontanero';
      this.urgencyPrice = 10;
      this.selectedProfessions = ['fontanero'];
    }
  }

  editPhoto() {
    const input = document.getElementById('photoInput') as HTMLInputElement;
    if (input) input.click();
  }

  handlePhotoChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 500;
          const MAX_HEIGHT = 500;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          this.avatarUrl = canvas.toDataURL(file.type || 'image/jpeg', 0.7);

          // Guardar avatar en localStorage
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            user.avatarUrl = this.avatarUrl;
            localStorage.setItem('user', JSON.stringify(user));
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  async saveData() {
    this.isEditing = false;

    const token = localStorage.getItem('token');
    if (!token) {
      this.showAlert('Error', 'No se ha encontrado sesión activa.');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Guardando cambios...',
    });
    await loading.present();

    // Actualizar string de profesiones a partir de lo seleccionado
    if (this.isWorker) {
      this.profesion = this.selectedProfessions.join(', ');
    }

    const url = `${environment.apiUrl}/api/user/profile`;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.post(url, {
      name: this.nombre,
      apellidos: this.apellidos,
      telefono: this.telefono,
      email: this.email,
      profesion: this.profesion,
      avatarUrl: this.avatarUrl,
      urgency_price: this.urgencyPrice
    }, { headers }).pipe(timeout(10000)).subscribe({
      next: (res: any) => {
        loading.dismiss();
        console.log('Profile updated successfully:', res);
        
        // Guardar cambios en local
        localStorage.setItem('user', JSON.stringify(res.user));
        this.userName = res.user.name || 'Usuario';
        this.showAlert('Éxito', 'Perfil actualizado correctamente.');

        if (this.isWorker && res.user.profesion) {
          this.profesion = res.user.profesion;
          this.selectedProfessions = this.profesion.split(',')
            .map(p => p.trim().toLowerCase())
            .filter(p => p.length > 0);
        }
      },
      error: (err) => {
        loading.dismiss();
        console.error('Update profile error:', err);
        this.showAlert('Error', 'No se pudo guardar la información en el servidor.');
        
        // Si hay error, revertimos al estado local guardado para no desincronizar
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          this.nombre = user.name || '';
          this.apellidos = user.apellidos || '';
          this.telefono = user.telefono || '';
          this.email = user.email || '';
          this.profesion = user.profesion || '';
          this.avatarUrl = user.avatarUrl || null;
          this.urgencyPrice = user.urgency_price !== undefined ? parseFloat(user.urgency_price) : 10;
          
          if (this.isWorker && this.profesion) {
            this.selectedProfessions = this.profesion.split(',')
              .map(p => p.trim().toLowerCase())
              .filter(p => p.length > 0);
          }
        }
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

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
