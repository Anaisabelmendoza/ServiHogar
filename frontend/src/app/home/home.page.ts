import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  userName: string = 'Usuario';
  role: string = 'cliente';
  hasPendingAppointments: boolean = false;

  services = [
    { id: 'electricista', name: 'Electricista', image: 'assets/services/electricidad.jpg' },
    { id: 'carpintero', name: 'Carpintero', image: 'assets/services/carpinteria.jpg' },
    { id: 'pintor', name: 'Pintor', image: 'assets/services/pintura.jpg' },
    { id: 'fontanero', name: 'Fontanero', image: 'assets/services/fontaneria.jpg' },
    { id: 'obrero', name: 'Obrero', image: 'assets/services/obrero.jpg' },
    { id: 'cerrajero', name: 'Cerrajero', image: 'assets/services/cerrajeria.jpg' }
  ];

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.userName = user.name || 'Usuario';
    }
    this.role = localStorage.getItem('role') || 'cliente';
    this.checkPendingAppointments();
  }

  ionViewWillEnter() {
    this.checkPendingAppointments();
  }

  checkPendingAppointments() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get(`${environment.apiUrl}/api/client/history?t=${Date.now()}`, { headers }).subscribe({
      next: (res: any) => {
        if (res.status === 'success' && res.data) {
          this.hasPendingAppointments = res.data.some((apt: any) => apt.status === 'pendiente' || apt.status === 'aceptado');
        }
      },
      error: () => {
        console.error('Error fetching client history for notification');
      }
    });
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  openService(id: string) {
    console.log('Opening service', id);
    this.router.navigate(['/service-request'], { queryParams: { service: id } });
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  goToAppointments() {
    this.router.navigate(['/appointments-history']);
  }
}
