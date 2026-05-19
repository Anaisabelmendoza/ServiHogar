import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

declare var L: any; // Leaflet Global Reference

@Component({
  selector: 'app-service-tracking',
  templateUrl: './service-tracking.page.html',
  styleUrls: ['./service-tracking.page.scss'],
  standalone: false,
})
export class ServiceTrackingPage implements OnInit, OnDestroy {
  profId: number | null = null;
  profName: string = '';
  profAvatar: string = '';
  profRating: number = 0;
  profPhone: string = '';
  requestId: number | null = null;

  // Propiedades de Mapa y GPS
  private map: any;
  private workerMarker: any;
  private clientMarker: any;
  private routeLine: any;
  private trackingInterval: any;

  // Coordenadas iniciales por defecto (Zona Úbeda, Jaén)
  workerLat: number = 38.0170;
  workerLng: number = -3.3650;
  clientLat: number = 38.0116;
  clientLng: number = -3.3705;

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['profId']) this.profId = parseInt(params['profId'], 10);
      if (params['profName']) this.profName = params['profName'];
      if (params['profAvatar']) this.profAvatar = params['profAvatar'];
      if (params['profRating']) this.profRating = parseInt(params['profRating'], 10);
      if (params['profPhone']) this.profPhone = params['profPhone'];
      if (params['requestId']) this.requestId = parseInt(params['requestId'], 10);
    });

    this.loadLeaflet();
  }

  ngOnDestroy() {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
    }
  }

  callProfessional() {
    const phone = this.profPhone || '600000011';
    window.location.href = `tel:${phone}`;
  }

  chatProfessional() {
    const phone = this.profPhone || '600000011';
    const msg = `Hola ${this.profName}, soy tu cliente de ServiHogar. ¿A qué hora estimas llegar aproximadamente?`;
    window.open(`https://wa.me/34${phone}?text=${encodeURIComponent(msg)}`, '_system');
  }

  finishJob() {
    console.log('Job finished successfully');
    this.router.navigate(['/review'], {
      queryParams: {
        profName: this.profName,
        profAvatar: this.profAvatar
      }
    });
  }

  isCancelModalOpen: boolean = false;

  cancelJob() {
    this.isCancelModalOpen = true;
  }

  confirmCancelJob() {
    this.isCancelModalOpen = false;
    this.router.navigate(['/home']);
  }

  dismissCancelModal() {
    this.isCancelModalOpen = false;
  }

  reportProblem() {
    console.log('Reporting problem');
    this.router.navigate(['/report-problem'], {
      queryParams: {
        profId: this.profId,
        profName: this.profName
      }
    });
  }

  scheduleAnother() {
    console.log('Scheduling another');
    this.router.navigate(['/home']);
  }

  // ── Leaflet & GPS Real-Time tracking ───────────────────────
  loadLeaflet() {
    if (document.getElementById('leaflet-css')) {
      this.initMap();
      return;
    }

    const css = document.createElement('link');
    css.id = 'leaflet-css';
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(css);

    const js = document.createElement('script');
    js.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    js.onload = () => {
      setTimeout(() => {
        this.initMap();
      }, 500);
    };
    document.body.appendChild(js);
  }

  initMap() {
    try {
      const container = document.getElementById('map');
      if (!container) return;

      this.map = L.map('map').setView([this.clientLat, this.clientLng], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(this.map);

      const clientIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      });

      const workerIcon = L.divIcon({
        html: `
          <div style="background-color: white; border: 3px solid #04608c; border-radius: 50%; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
            <img src="${this.profAvatar || 'https://i.pravatar.cc/150?img=11'}" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
        `,
        className: '',
        iconSize: [42, 42],
        iconAnchor: [21, 21]
      });

      this.clientMarker = L.marker([this.clientLat, this.clientLng], { icon: clientIcon })
        .addTo(this.map)
        .bindPopup('Tu Domicilio')
        .openPopup();

      this.workerMarker = L.marker([this.workerLat, this.workerLng], { icon: workerIcon })
        .addTo(this.map)
        .bindPopup(`${this.profName} (En Camino)`);

      this.routeLine = L.polyline([
        [this.workerLat, this.workerLng],
        [this.clientLat, this.clientLng]
      ], {
        color: '#04608c',
        weight: 4,
        dashArray: '5, 10',
        opacity: 0.8
      }).addTo(this.map);

      this.map.fitBounds(L.latLngBounds([
        [this.workerLat, this.workerLng],
        [this.clientLat, this.clientLng]
      ]), { padding: [40, 40] });

      this.startTrackingPoll();

    } catch (e) {
      console.error('Error al inicializar Leaflet:', e);
    }
  }

  startTrackingPoll() {
    if (!this.requestId) return;

    this.trackingInterval = setInterval(() => {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      this.http.get(`${environment.apiUrl}/api/service-requests/${this.requestId}/tracking`, { headers }).subscribe({
        next: (res: any) => {
          if (res.status === 'success' && res.data.trabajador) {
            const t = res.data.trabajador;
            if (t.latitude && t.longitude) {
              this.workerLat = parseFloat(t.latitude);
              this.workerLng = parseFloat(t.longitude);

              if (this.workerMarker) {
                this.workerMarker.setLatLng([this.workerLat, this.workerLng]);
              }

              if (this.routeLine) {
                this.routeLine.setLatLngs([
                  [this.workerLat, this.workerLng],
                  [this.clientLat, this.clientLng]
                ]);
              }
            }
          }
        },
        error: (err) => console.error('Error al recibir ubicación en tiempo real:', err)
      });
    }, 4000);
  }

  openGoogleMapsRoute() {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${this.workerLat},${this.workerLng}&destination=${this.clientLat},${this.clientLng}&travelmode=driving`;
    window.open(url, '_system');
  }
}
