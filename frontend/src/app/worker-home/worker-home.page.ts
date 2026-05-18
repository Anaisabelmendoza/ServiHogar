import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

interface ServiceRequest {
  id: number;
  clientName: string;
  avatar: string;
  rating: number;
  phone: string;
  description?: string;
  appointmentType?: string;
  appointmentDate?: string;
  address?: string;
}

interface JobHistory {
  id: number;
  clientName: string;
  avatar: string;
  date: string;
  service: string;
  rating: number;
}

@Component({
  selector: 'app-worker-home',
  templateUrl: './worker-home.page.html',
  styleUrls: ['./worker-home.page.scss'],
  standalone: false,
})
export class WorkerHomePage implements OnInit {
  workerName: string = 'Usuario';
  isActive: boolean = true;
  activeTab: 'solicitudes' | 'historial' = 'solicitudes';

  // Mock data — en el futuro vendrá de la API Laravel
  requests: ServiceRequest[] = [
    {
      id: 1,
      clientName: 'Nombre Cliente',
      avatar: 'https://i.pravatar.cc/150?img=12',
      rating: 0,
      phone: '600000001',
      description: 'Se me ha roto una tubería en el baño y hay una fuga de agua importante.',
      appointmentType: 'urgente',
      address: 'Calle Mayor 12, Úbeda'
    },
    {
      id: 2,
      clientName: 'Nombre Cliente',
      avatar: 'https://i.pravatar.cc/150?img=15',
      rating: 0,
      phone: '600000002',
      description: 'El enchufe del salón no funciona y necesito revisarlo.',
      appointmentType: 'programar',
      appointmentDate: '20 / 05 / 2026 - 10:00',
      address: 'Avenida Andalucía 5, Úbeda'
    }
  ];

  history: JobHistory[] = [];

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.loadData();
  }

  ionViewWillEnter() {
    this.loadData();
  }

  loadData() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.workerName = user.name || 'Usuario';
      this.isActive = user.is_active !== undefined ? user.is_active : true;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.loadMockData();
      this.loadLocalHistory();
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Cargar Solicitudes activas de Aiven
    this.http.get(`${environment.apiUrl}/api/worker/requests`, { headers }).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.isActive = res.is_active;
          if (res.data && res.data.length > 0) {
            this.requests = res.data.map((req: any) => ({
              id: req.id,
              clientName: req.cliente ? req.cliente.name : 'Cliente',
              avatar: req.cliente?.avatarUrl || 'https://i.pravatar.cc/150?img=12',
              rating: req.rating || 0,
              phone: req.phone || (req.cliente ? req.cliente.telefono : '600000001'),
              description: req.description,
              appointmentType: req.appointment_type,
              appointmentDate: req.appointment_date,
              address: req.address
            }));
          } else {
            this.loadMockData(); // fallback si la bd de Aiven está vacía para ver algo de diseño
          }
        }
      },
      error: (err) => {
        console.error('Error al cargar solicitudes de Aiven:', err);
        this.loadMockData();
      }
    });

    // Cargar Historial de Aiven
    this.http.get(`${environment.apiUrl}/api/worker/history`, { headers }).subscribe({
      next: (res: any) => {
        if (res.status === 'success' && res.data && res.data.length > 0) {
          this.history = res.data.map((h: any) => ({
            id: h.id,
            clientName: h.cliente ? h.cliente.name : 'Cliente',
            avatar: h.cliente?.avatarUrl || 'https://i.pravatar.cc/150?img=12',
            date: new Date(h.updated_at).toLocaleDateString(),
            service: 'Servicio de Reparación',
            rating: h.rating || 0
          }));
        } else {
          this.loadLocalHistory(); // fallback si el historial de Aiven está vacío
        }
      },
      error: (err) => {
        console.error('Error al cargar historial de Aiven:', err);
        this.loadLocalHistory();
      }
    });
  }

  loadMockData() {
    const reviews = JSON.parse(localStorage.getItem('clientReviews') || '[]');
    this.requests.forEach(req => {
      const clientReviews = reviews.filter((r: any) => r.clientName === req.clientName);
      if (clientReviews.length > 0) {
        const total = clientReviews.reduce((sum: number, r: any) => sum + r.rating, 0);
        req.rating = Math.round(total / clientReviews.length);
      } else {
        req.rating = 0;
      }
    });
  }

  loadLocalHistory() {
    const reviews = JSON.parse(localStorage.getItem('clientReviews') || '[]');
    this.history = reviews.map((r: any, idx: number) => ({
      id: idx + 1,
      clientName: r.clientName,
      avatar: 'https://i.pravatar.cc/150?img=12',
      date: r.date || new Date().toLocaleDateString(),
      service: 'Servicio ServiHogar',
      rating: r.rating
    }));
  }

  toggleActiveState() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.post(`${environment.apiUrl}/api/worker/toggle-active`, {
      is_active: this.isActive
    }, { headers }).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          console.log('Estado de actividad sincronizado con Aiven:', res.is_active);
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            user.is_active = res.is_active;
            localStorage.setItem('user', JSON.stringify(user));
          }
        }
      },
      error: (err) => {
        console.error('Error al sincronizar estado activo con Aiven:', err);
      }
    });
  }

  setTab(tab: 'solicitudes' | 'historial') {
    this.activeTab = tab;
  }

  getStars(rating: number): string[] {
    const stars: string[] = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating ? 'star' : 'star-outline');
    }
    return stars;
  }

  openJobDetail(req: ServiceRequest) {
    this.router.navigate(['/worker-job-detail'], {
      queryParams: {
        id: req.id,
        clientName: req.clientName,
        description: req.description || '',
        type: req.appointmentType || 'urgente',
        date: req.appointmentDate || '',
        address: req.address || 'Calle Mayor 12, Úbeda'
      }
    });
  }

  callClient(req: ServiceRequest) {
    const phone = req.phone || '600000001';
    window.location.href = `tel:${phone}`;
  }

  chatClient(req: ServiceRequest) {
    const phone = req.phone || '600000001';
    const msg = `Hola ${req.clientName}, soy tu profesional de ServiHogar. Estoy preparando las herramientas para tu servicio de asistencia técnica.`;
    window.open(`https://wa.me/34${phone}?text=${encodeURIComponent(msg)}`, '_system');
  }
}
