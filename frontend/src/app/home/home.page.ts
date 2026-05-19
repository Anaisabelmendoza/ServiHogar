import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  userName: string = 'Usuario';
  role: string = 'cliente';

  services = [
    { id: 'electricista', name: 'Electricista', image: 'assets/services/electricidad.jpg' },
    { id: 'carpintero', name: 'Carpintero', image: 'assets/services/carpinteria.jpg' },
    { id: 'pintor', name: 'Pintor', image: 'assets/services/pintura.jpg' },
    { id: 'fontanero', name: 'Fontanero', image: 'assets/services/fontaneria.jpg' },
    { id: 'obrero', name: 'Obrero', image: 'assets/services/obrero.jpg' },
    { id: 'cerrajero', name: 'Cerrajero', image: 'assets/services/cerrajeria.jpg' }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.userName = user.name || 'Usuario';
    }
    this.role = localStorage.getItem('role') || 'cliente';
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
