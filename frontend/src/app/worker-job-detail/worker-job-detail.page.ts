import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-worker-job-detail',
  templateUrl: './worker-job-detail.page.html',
  styleUrls: ['./worker-job-detail.page.scss'],
  standalone: false,
})
export class WorkerJobDetailPage implements OnInit {
  isActive: boolean = true;

  // Datos del trabajo (llegan por queryParams)
  clientName: string = '';
  clientAddress: string = 'Calle Mayor 12, Úbeda';
  problemDescription: string = '';
  appointmentType: string = 'urgente'; // 'urgente' | 'programar'
  appointmentDate: string = '';
  requestId: number = 0;
  imageUrl: string = '';
  clientStatus: string = 'pendiente'; // 'pendiente' | 'aceptado' | 'en_progreso'
  isImageModalOpen: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.clientName        = params['clientName']   || '';
      this.clientAddress     = params['address']      || 'Calle Mayor 12, Úbeda';
      this.problemDescription = params['description'] || '';
      this.appointmentType   = params['type']         || 'urgente';
      this.appointmentDate   = params['date']         || '';
      this.requestId         = params['id']           || 0;
      this.imageUrl          = params['imageUrl']     || '';
      this.clientStatus      = params['status']       || 'pendiente';
    });
  }

  startJob() {
    console.log('Action triggered for request:', this.requestId);

    const token = localStorage.getItem('token');
    if (!token || !this.requestId) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    if (this.appointmentType === 'programar' && this.clientStatus === 'pendiente') {
      // Aceptar la cita programada
      this.http.post(`${environment.apiUrl}/api/worker/requests/${this.requestId}/status`, {
        status: 'aceptado'
      }, { headers }).subscribe({
        next: (res) => {
          console.log('Cita aceptada en Aiven:', res);
          this.router.navigate(['/worker-home'], { queryParams: { tab: 'historial' } });
        },
        error: (err) => {
          console.error('Error al aceptar la cita:', err);
        }
      });
    } else {
      // Iniciar trabajo
      this.http.post(`${environment.apiUrl}/api/worker/requests/${this.requestId}/status`, {
        status: 'en_progreso'
      }, { headers }).subscribe({
        next: (res) => {
          console.log('Trabajo iniciado en Aiven:', res);
        },
        error: (err) => {
          console.error('Error al iniciar el trabajo:', err);
        }
      });

      this.router.navigate(['/worker-working'], {
        queryParams: {
          clientName: this.clientName,
          id: this.requestId,
          address: this.clientAddress,
          type: this.appointmentType
        }
      });
    }
  }

  rejectJob() {
    console.log('Rejecting request:', this.requestId);

    const token = localStorage.getItem('token');
    if (!token || !this.requestId) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.post(`${environment.apiUrl}/api/worker/requests/${this.requestId}/status`, {
      status: 'rechazado'
    }, { headers }).subscribe({
      next: (res) => {
        console.log('Cita rechazada en Aiven:', res);
        this.router.navigate(['/worker-home'], { queryParams: { tab: 'solicitudes' } });
      },
      error: (err) => {
        console.error('Error al rechazar la cita:', err);
      }
    });
  }

  openImageModal() {
    this.isImageModalOpen = true;
  }

  closeImageModal() {
    this.isImageModalOpen = false;
  }
}
