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
    });
  }

  startJob() {
    console.log('Starting job for request:', this.requestId);

    const token = localStorage.getItem('token');
    if (token && this.requestId) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      // Actualizar estado a 'en_progreso' en la base de datos de Aiven
      this.http.post(`${environment.apiUrl}/api/worker/requests/${this.requestId}/status`, {
        status: 'en_progreso'
      }, { headers }).subscribe({
        next: (res) => {
          console.log('Estado actualizado a en_progreso en Aiven:', res);
        },
        error: (err) => {
          console.error('Error al actualizar estado en Aiven:', err);
        }
      });
    }

    this.router.navigate(['/worker-working'], {
      queryParams: {
        clientName: this.clientName,
        id: this.requestId,
        address: this.clientAddress
      }
    });
  }
}
