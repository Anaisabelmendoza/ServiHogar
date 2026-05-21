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

  private startLat: number | null = null;
  private startLng: number | null = null;
  private gpsUpdateInterval: any;
  private gpsWatchId: any;

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
    if (this.gpsWatchId && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.gpsWatchId);
    }
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
    const dest = encodeURIComponent(this.address || 'Madrid, Spain');
    
    // Si tenemos la ubicación del profesional, trazamos la ruta de origen a destino
    if (this.startLat && this.startLng) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${this.startLat},${this.startLng}&destination=${dest}&travelmode=driving`;
      window.open(url, '_system');
    } else {
      // Fallback: Si no tenemos el GPS capturado, abrimos la ruta igualmente 
      // y dejamos que Google Maps use la ubicación actual del teléfono como origen.
      const url = `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`;
      window.open(url, '_system');
    }
  }

  // ── Acciones ─────────────────────────────────────────────
  finishJob() {
    clearInterval(this.timerInterval);
    clearInterval(this.progressInterval);
    // Navegar a la pantalla de valoración del cliente
    this.router.navigate(['/worker-review'], {
      queryParams: {
        clientName: this.clientName,
        avatar: '',
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

  // ── GPS Tracking Real ──────────────────────────────
  startGPSTracking() {
    if (navigator.geolocation) {
      // 1. Iniciar observador de GPS real (requiere permisos y HTTPS/localhost)
      this.gpsWatchId = navigator.geolocation.watchPosition(
        (pos) => {
          this.startLat = pos.coords.latitude;
          this.startLng = pos.coords.longitude;
        },
        (err) => {
          console.error("Error obteniendo GPS (asegúrate de dar permisos y usar HTTPS/localhost):", err);
        },
        { enableHighAccuracy: true, maximumAge: 0 }
      );

      // 2. Enviar la ubicación real al backend cada 4 segundos
      this.gpsUpdateInterval = setInterval(() => {
        if (this.startLat !== null && this.startLng !== null) {
          this.sendLocationToBackend(this.startLat, this.startLng);
        }
      }, 4000);
    } else {
      console.error("Geolocalización no soportada por este navegador");
    }
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
