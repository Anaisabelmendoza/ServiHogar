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
  address: string = '';

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

  // Simulación de ruta GPS para demostración
  private startLat = 38.0170;
  private startLng = -3.3650;
  private destLat = 38.0116;
  private destLng = -3.3705;
  private currentStep = 0;
  private totalSteps = 30;
  private gpsUpdateInterval: any;

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
      if (params['address']) this.address = params['address'];
    });

    this.startTimer();
    this.animateProgress();
    this.startGPSTracking();
  }

  ngOnDestroy() {
    // Limpiar los intervalos al salir de la página
    clearInterval(this.timerInterval);
    clearInterval(this.progressInterval);
    clearInterval(this.gpsUpdateInterval);
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

  // ── GPS ──────────────────────────────────────────────────
  openGPS() {
    const query = encodeURIComponent(this.address || 'Madrid, Spain');
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_system');
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

  // ── GPS Tracking & Simulation ──────────────────────────────
  startGPSTracking() {
    // Intentamos coger la ubicación real primero
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        this.startLat = pos.coords.latitude;
        this.startLng = pos.coords.longitude;
        // Ajustamos destino ligeramente cerca del profesional
        this.destLat = this.startLat - 0.003;
        this.destLng = this.startLng - 0.003;
      });
    }

    this.gpsUpdateInterval = setInterval(() => {
      if (this.currentStep <= this.totalSteps) {
        const ratio = this.currentStep / this.totalSteps;
        const currentLat = this.startLat + (this.destLat - this.startLat) * ratio;
        const currentLng = this.startLng + (this.destLng - this.startLng) * ratio;
        
        this.sendLocationToBackend(currentLat, currentLng);
        this.currentStep++;
      } else {
        // Al terminar los pasos de simulación, reiniciar o mantener en destino
        this.sendLocationToBackend(this.destLat, this.destLng);
      }
    }, 4000);
  }

  sendLocationToBackend(lat: number, lng: number) {
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      this.http.post(`${environment.apiUrl}/api/worker/location`, {
        latitude: lat,
        longitude: lng
      }, { headers }).subscribe({
        next: (res) => console.log('Ubicación enviada al servidor:', lat, lng),
        error: (err) => console.error('Error al actualizar ubicación:', err)
      });
    }
  }
}
