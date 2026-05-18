import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-worker-working',
  templateUrl: './worker-working.page.html',
  styleUrls: ['./worker-working.page.scss'],
  standalone: false,
})
export class WorkerWorkingPage implements OnInit, OnDestroy {

  workerName: string = 'Usuario';
  clientName: string = 'Nombre Cliente';
  requestId: number = 0;

  // Cronómetro
  elapsedSeconds: number = 0;
  timerDisplay: string = '00: 00: 00';
  private timerInterval: any;

  // Barra de progreso (oscila entre 10% y 90% para dar sensación de actividad)
  progressPercent: number = 15;
  private progressInterval: any;
  private progressDirection: number = 1;

  // Modal de cancelación
  isCancelModalOpen: boolean = false;

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.workerName = user.name || 'Usuario';
    }

    this.route.queryParams.subscribe(params => {
      if (params['clientName']) this.clientName = params['clientName'];
      if (params['id']) this.requestId = parseInt(params['id'], 10);
    });

    this.startTimer();
    this.animateProgress();
  }

  ngOnDestroy() {
    // Limpiar los intervalos al salir de la página
    clearInterval(this.timerInterval);
    clearInterval(this.progressInterval);
  }

  // ── Cronómetro ──────────────────────────────────────────
  startTimer() {
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds++;
      this.timerDisplay = this.formatTime(this.elapsedSeconds);
    }, 1000);
  }

  formatTime(totalSeconds: number): string {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${this.pad(h)}: ${this.pad(m)}: ${this.pad(s)}`;
  }

  pad(n: number): string {
    return n < 10 ? '0' + n : '' + n;
  }

  // ── Barra de progreso animada ─────────────────────────────
  animateProgress() {
    this.progressInterval = setInterval(() => {
      this.progressPercent += this.progressDirection * 0.4;
      if (this.progressPercent >= 88) this.progressDirection = -1;
      if (this.progressPercent <= 12) this.progressDirection = 1;
    }, 50);
  }

  // ── Acciones ─────────────────────────────────────────────
  finishJob() {
    clearInterval(this.timerInterval);
    clearInterval(this.progressInterval);
    // Navegar a la pantalla de valoración del cliente
    this.router.navigate(['/worker-review'], {
      queryParams: {
        clientName: this.clientName,
        avatar: 'https://i.pravatar.cc/150?img=12',
        id: this.requestId
      }
    });
  }

  cancelJob() {
    this.isCancelModalOpen = true;
  }

  confirmCancel() {
    clearInterval(this.timerInterval);
    clearInterval(this.progressInterval);
    this.isCancelModalOpen = false;

    const token = localStorage.getItem('token');
    if (token && this.requestId) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      this.http.post(`${environment.apiUrl}/api/worker/requests/${this.requestId}/status`, {
        status: 'cancelado'
      }, { headers }).subscribe({
        next: (res) => {
          console.log('Trabajo cancelado correctamente en Aiven:', res);
        },
        error: (err) => {
          console.error('Error al actualizar cancelación en Aiven:', err);
        }
      });
    }

    this.router.navigate(['/worker-home']);
  }

  dismissCancelModal() {
    this.isCancelModalOpen = false;
  }

  reportProblem() {
    this.router.navigate(['/report-problem'], {
      queryParams: {
        role: 'worker',
        profName: this.clientName,
        requestId: this.requestId
      }
    });
  }
}
