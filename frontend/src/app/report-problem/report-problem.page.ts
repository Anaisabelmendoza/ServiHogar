import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-report-problem',
  templateUrl: './report-problem.page.html',
  styleUrls: ['./report-problem.page.scss'],
  standalone: false,
})
export class ReportProblemPage implements OnInit {
  profId: number | null = null;
  profName: string = '';
  isWorker: boolean = false;
  requestId: number | null = null;
  
  selectedReasons: { [key: string]: boolean } = {
    incompleto: false,
    comportamiento: false,
    tarde: false,
    danos: false,
    ausente: false,
    impago: false,
    otros: false
  };
  
  otherReasonText: string = '';

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['profId']) this.profId = parseInt(params['profId'], 10);
      if (params['profName']) this.profName = params['profName'];
      if (params['requestId']) this.requestId = parseInt(params['requestId'], 10);
      this.isWorker = params['role'] === 'worker';
    });
  }

  toggleReason(reason: string) {
    this.selectedReasons[reason] = !this.selectedReasons[reason];
  }

  submitReport() {
    console.log('Report submitted by:', this.isWorker ? 'Worker' : 'Client');
    
    // Unir los motivos seleccionados en texto plano
    const motivosList = Object.keys(this.selectedReasons)
      .filter(key => this.selectedReasons[key])
      .join(', ');

    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      this.http.post(`${environment.apiUrl}/api/incidents`, {
        service_request_id: this.requestId,
        motivo: motivosList || 'Otros motivos',
        detalle: this.otherReasonText
      }, { headers }).subscribe({
        next: (res) => {
          console.log('Incidente guardado en Aiven:', res);
        },
        error: (err) => {
          console.error('Error al guardar incidente en Aiven:', err);
        }
      });
    }

    if (this.isWorker) {
      this.router.navigate(['/worker-home']);
    } else {
      this.router.navigate(['/home']);
    }
  }
}
