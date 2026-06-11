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
  clientAddress: string = '';
  workerAddress: string = '';
  private lastGeocodedLat: number | null = null;
  private lastGeocodedLng: number | null = null;

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
        profAvatar: this.profAvatar,
        requestId: this.requestId
      }
    });
  }

  isCancelModalOpen: boolean = false;

  cancelJob() {
    this.isCancelModalOpen = true;
  }

  confirmCancelJob() {
    this.isCancelModalOpen = false;
    
    if (this.requestId) {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      this.http.post(`${environment.apiUrl}/api/worker/requests/${this.requestId}/status`, {
        status: 'cancelado'
      }, { headers }).subscribe({
        next: (res: any) => {
          console.log('Servicio cancelado exitosamente en base de datos:', res);
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error('Error al cancelar el servicio en base de datos:', err);
          this.router.navigate(['/home']);
        }
      });
    } else {
      this.router.navigate(['/home']);
    }
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
            ${this.profAvatar 
              ? `<img src="${this.profAvatar}" style="width: 100%; height: 100%; object-fit: cover;">` 
              : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background-color: #f0f0f0; color: #999; font-size: 24px;">👤</div>`
            }
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

    // Fetch immediately
    this.fetchTrackingData();

    // Poll every 4 seconds
    this.trackingInterval = setInterval(() => {
      this.fetchTrackingData();
    }, 4000);
  }

  fetchTrackingData() {
    if (!this.requestId) return;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get(`${environment.apiUrl}/api/service-requests/${this.requestId}/tracking`, { headers }).subscribe({
      next: (res: any) => {
        if (res.status === 'success' && res.data) {
          if (res.data.address) {
            this.clientAddress = res.data.address;
          }

          if (res.data.cliente) {
            const c = res.data.cliente;
            if (c.latitude && c.longitude) {
              this.clientLat = parseFloat(c.latitude);
              this.clientLng = parseFloat(c.longitude);

              if (this.clientMarker) {
                this.clientMarker.setLatLng([this.clientLat, this.clientLng]);
              }
            }
          }

          if (res.data.trabajador) {
            const t = res.data.trabajador;
            if (t.average_rating !== undefined) {
              this.profRating = parseFloat(t.average_rating);
            }
            if (t.latitude && t.longitude) {
              const newLat = parseFloat(t.latitude);
              const newLng = parseFloat(t.longitude);

              if (this.workerLat !== newLat || this.workerLng !== newLng || !this.workerAddress) {
                this.workerLat = newLat;
                this.workerLng = newLng;

                // Solo llamar a la API si cambió la coordenada o si aún no tenemos la dirección
                if (this.lastGeocodedLat !== newLat || this.lastGeocodedLng !== newLng) {
                  this.lastGeocodedLat = newLat;
                  this.lastGeocodedLng = newLng;

                  this.http.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}&zoom=18&addressdetails=1`).subscribe({
                    next: (geodata: any) => {
                      if (geodata && geodata.display_name) {
                        const parts = geodata.display_name.split(', ');
                        // Tomamos una dirección simplificada (ej: calle y número)
                        this.workerAddress = parts.slice(0, 2).join(', ');
                      } else {
                        this.workerAddress = 'Ubicación encontrada en el mapa';
                      }
                    },
                    error: () => {
                      this.workerAddress = 'Ubicación rastreada en el mapa';
                    }
                  });
                }
              }

              if (this.workerMarker) {
                this.workerMarker.setLatLng([this.workerLat, this.workerLng]);
              }
            }
          }

          // Update route line and bounds dynamically with new worker and client coordinates
          if (this.routeLine) {
            this.routeLine.setLatLngs([
              [this.workerLat, this.workerLng],
              [this.clientLat, this.clientLng]
            ]);
          }

          if (this.map) {
            this.map.fitBounds(L.latLngBounds([
              [this.workerLat, this.workerLng],
              [this.clientLat, this.clientLng]
            ]), { padding: [40, 40] });
          }
        }
      },
      error: (err) => console.error('Error al recibir ubicación en tiempo real:', err)
    });
  }

  openGoogleMapsRoute() {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${this.workerLat},${this.workerLng}&destination=${this.clientLat},${this.clientLng}&travelmode=driving`;
    window.open(url, '_system');
  }
}
