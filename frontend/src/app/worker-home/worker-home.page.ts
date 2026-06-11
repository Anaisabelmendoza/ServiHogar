import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { filter } from 'rxjs/operators';

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
  imageUrl?: string;
  status: string;
}

interface JobHistory {
  id: number;
  clientName: string;
  avatar: string;
  date: string;
  service: string;
  rating: number;
  worker_report: string;
  invoice_price: number;
  invoice_materials: string;
  invoice_hours: number;
  client_phone?: string;
  client_address?: string;
  status: string;
  appointmentType?: string;
  appointmentDate?: string;
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

  requests: ServiceRequest[] = [];
  history: JobHistory[] = [];

  // Modal de Detalles del Historial y Factura
  isHistoryModalOpen: boolean = false;
  selectedJob: any = null;

  constructor(
    private router: Router, 
    private http: HttpClient,
    private toastController: ToastController
  ) {
    // Escuchar cambios de ruta para recargar datos cuando volvemos a worker-home
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const urlPart = event.urlAfterRedirects.split('?');
      if (urlPart[0] === '/worker-home') {
        const urlTree = this.router.parseUrl(event.urlAfterRedirects);
        if (urlTree.queryParams['tab'] === 'historial') {
          this.activeTab = 'historial';
        } else if (urlTree.queryParams['tab'] === 'solicitudes') {
          this.activeTab = 'solicitudes';
        }
        this.loadData();
      }
    });
  }

  ngOnInit() {
    this.loadData();
  }

  ionViewWillEnter() {
    this.loadData();
  }

  loadData() {
    const urlTree = this.router.parseUrl(this.router.url);
    if (urlTree.queryParams['tab'] === 'historial') {
      this.activeTab = 'historial';
    } else if (urlTree.queryParams['tab'] === 'solicitudes') {
      this.activeTab = 'solicitudes';
    }

    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.workerName = user.name || 'Usuario';
      this.isActive = user.is_active !== undefined ? user.is_active : true;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.requests = [];
      this.history = [];
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Cargar Solicitudes activas de Aiven
    this.http.get(`${environment.apiUrl}/api/worker/requests?t=${Date.now()}`, { headers }).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.isActive = res.is_active;
          if (res.data && res.data.length > 0) {
            this.requests = res.data.map((req: any) => ({
              id: req.id,
              clientName: req.cliente ? req.cliente.name : 'Cliente',
              avatar: req.cliente?.avatarUrl || `https://ui-avatars.com/api/?name=${req.cliente?.name || 'C'}&background=random`,
              rating: req.cliente?.average_rating !== undefined ? req.cliente.average_rating : 5,
              phone: req.phone || (req.cliente ? req.cliente.telefono : '600000001'),
              description: req.description,
              appointmentType: req.appointment_type,
              appointmentDate: req.appointment_date,
              address: req.address,
              imageUrl: req.image_url,
              status: req.status || 'pendiente'
            }));
          } else {
            this.requests = [];
          }
        }
      },
      error: (err) => {
        console.error('Error al cargar solicitudes de Aiven:', err);
        this.requests = [];
      }
    });

    // Cargar Historial de Aiven con TODOS los campos de factura e informe
    this.http.get(`${environment.apiUrl}/api/worker/history?t=${Date.now()}`, { headers }).subscribe({
      next: (res: any) => {
        if (res.status === 'success' && res.data && res.data.length > 0) {
          this.history = res.data.map((h: any) => ({
            id: h.id,
            clientName: h.cliente ? h.cliente.name : 'Cliente',
            avatar: h.cliente?.avatarUrl || `https://ui-avatars.com/api/?name=${h.cliente?.name || 'C'}&background=random`,
            date: h.appointment_type === 'programar' && h.appointment_date
              ? this.formatDateTime(h.appointment_date)
              : new Date(h.updated_at).toLocaleDateString(),
            service: h.description || 'Servicio de Reparación',
            rating: h.worker_rating || 0,
            worker_report: h.worker_report || '',
            invoice_price: Number(h.invoice_price) || 0,
            invoice_materials: h.invoice_materials || '',
            invoice_hours: Number(h.invoice_hours) || 0,
            client_phone: h.phone || (h.cliente ? h.cliente.telefono : ''),
            client_address: h.address || '',
            status: h.status || 'finalizado',
            appointmentType: h.appointment_type,
            appointmentDate: h.appointment_date
          }));
        } else {
          this.history = [];
        }
      },
      error: (err) => {
        console.error('Error al cargar historial de Aiven:', err);
        this.history = [];
      }
    });
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

  formatDateTime(isoString: string): string {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;
      return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoString;
    }
  }

  get upcomingAppointments(): JobHistory[] {
    return this.history.filter(h => h.status === 'aceptado');
  }

  get completedJobs(): JobHistory[] {
    return this.history.filter(h => h.status === 'finalizado');
  }

  get pendingReminders(): JobHistory[] {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.history.filter(h => {
      if (h.status === 'aceptado' && h.appointmentDate) {
        const appDate = new Date(h.appointmentDate);
        const isToday = appDate.getDate() === today.getDate() &&
                        appDate.getMonth() === today.getMonth() &&
                        appDate.getFullYear() === today.getFullYear();
        const isTomorrow = appDate.getDate() === tomorrow.getDate() &&
                           appDate.getMonth() === tomorrow.getMonth() &&
                           appDate.getFullYear() === tomorrow.getFullYear();
        return isToday || isTomorrow;
      }
      return false;
    });
  }

  formatReminderDate(isoString: string | undefined): string {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const isToday = date.getDate() === today.getDate() &&
                      date.getMonth() === today.getMonth() &&
                      date.getFullYear() === today.getFullYear();
      const isTomorrow = date.getDate() === tomorrow.getDate() &&
                         date.getMonth() === tomorrow.getMonth() &&
                         date.getFullYear() === tomorrow.getFullYear();

      const timeStr = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

      if (isToday) {
        return `hoy a las ${timeStr}`;
      } else if (isTomorrow) {
        return `mañana a las ${timeStr}`;
      } else {
        return `${date.toLocaleDateString('es-ES')} a las ${timeStr}`;
      }
    } catch (e) {
      return isoString;
    }
  }

  openJobDetail(req: ServiceRequest) {
    this.router.navigate(['/worker-job-detail'], {
      queryParams: {
        id: req.id,
        clientName: req.clientName,
        description: req.description || '',
        type: req.appointmentType || 'urgente',
        date: req.appointmentDate || '',
        address: req.address || 'Calle Mayor 12, Úbeda',
        imageUrl: req.imageUrl || '',
        status: req.status || 'pendiente'
      }
    });
  }

  openUpcomingJobDetail(job: JobHistory) {
    this.router.navigate(['/worker-job-detail'], {
      queryParams: {
        id: job.id,
        clientName: job.clientName,
        description: job.service || '',
        type: job.appointmentType || 'programar',
        date: job.appointmentDate || '',
        address: job.client_address || 'Calle Mayor 12, Úbeda',
        imageUrl: '',
        status: job.status || 'aceptado'
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

  // Métodos para el Modal del Historial
  openHistoryDetail(job: JobHistory) {
    this.selectedJob = { ...job };
    this.isHistoryModalOpen = true;
  }

  dismissHistoryModal() {
    this.isHistoryModalOpen = false;
    this.selectedJob = null;
  }

  setHistoryRating(rating: number) {
    if (this.selectedJob) {
      this.selectedJob.rating = rating;
    }
  }

  async saveHistoryInvoice() {
    if (!this.selectedJob) return;

    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      try {
        await this.http.post(`${environment.apiUrl}/api/service-requests/${this.selectedJob.id}/invoice`, {
          worker_report: this.selectedJob.worker_report,
          invoice_price: this.selectedJob.invoice_price,
          invoice_materials: this.selectedJob.invoice_materials,
          invoice_hours: this.selectedJob.invoice_hours,
          worker_rating: this.selectedJob.rating
        }, { headers }).toPromise();

        const toast = await this.toastController.create({
          message: '¡Factura e informe actualizados correctamente!',
          duration: 2500,
          color: 'success',
          position: 'bottom'
        });
        await toast.present();

        this.isHistoryModalOpen = false;
        this.loadData(); // recargar historial actualizado
      } catch (err) {
        console.error('Error al actualizar factura:', err);
        const errToast = await this.toastController.create({
          message: 'Error al guardar los cambios en el servidor.',
          duration: 3000,
          color: 'danger',
          position: 'bottom'
        });
        await errToast.present();
      }
    }
  }

  printInvoice() {
    if (!this.selectedJob) return;

    const job = this.selectedJob;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const today = new Date().toLocaleDateString();
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Factura ServiHogar - Solicitud #${job.id}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; padding: 40px; line-height: 1.6; }
            .invoice-header { display: flex; justify-content: space-between; border-bottom: 2px solid #04608c; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: bold; color: #04608c; text-transform: uppercase; }
            .invoice-title { font-size: 24px; font-weight: bold; color: #555; }
            .section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .section-title { font-size: 16px; font-weight: bold; color: #04608c; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .table th { background: #f8fafc; border-bottom: 2px solid #ddd; text-align: left; padding: 12px; font-weight: bold; color: #555; }
            .table td { border-bottom: 1px solid #eee; padding: 12px; }
            .total-row td { font-weight: bold; font-size: 18px; color: #04608c; border-top: 2px solid #04608c; }
            .footer { text-align: center; font-size: 12px; color: #888; margin-top: 60px; border-top: 1px solid #eee; padding-top: 20px; }
            .report-box { background: #f8fafc; border-left: 4px solid #30b6e1; padding: 15px; border-radius: 4px; margin-bottom: 30px; }
          </style>
        </head>
        <body onload="window.print()">
          <div class="invoice-header">
            <div>
              <div class="logo">ServiHogar</div>
              <div>Asistencia Técnica Express</div>
            </div>
            <div style="text-align: right;">
              <div class="invoice-title">FACTURA DE SERVICIO</div>
              <div><strong>Nº Factura:</strong> SH-${job.id}</div>
              <div><strong>Fecha Emisión:</strong> ${today}</div>
            </div>
          </div>

          <div class="section-grid">
            <div>
              <div class="section-title">PRESTADOR DEL SERVICIO</div>
              <div><strong>Profesional:</strong> ${this.workerName}</div>
              <div>ServiHogar Network</div>
            </div>
            <div>
              <div class="section-title">CLIENTE</div>
              <div><strong>Nombre:</strong> ${job.clientName}</div>
              <div><strong>Teléfono:</strong> ${job.client_phone || 'No especificado'}</div>
              <div><strong>Dirección:</strong> ${job.client_address || 'No especificada'}</div>
            </div>
          </div>

          <div class="section-title">INFORME DEL SERVICIO REALIZADO</div>
          <div class="report-box">
            <strong>Descripción técnica:</strong><br/>
            ${job.worker_report || 'No especificado'}
          </div>

          <div class="section-title">DESGLOSE DEL TRABAJO</div>
          <table class="table">
            <thead>
              <tr>
                <th>Concepto / Detalle del Trabajo</th>
                <th>Horas</th>
                <th style="text-align: right;">Importe Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>${job.service}</strong><br/>
                  <small>Mano de obra especializada a domicilio</small>
                </td>
                <td>${job.invoice_hours || 1} h</td>
                <td style="text-align: right;">${(job.invoice_price / 1.21).toFixed(2)} €</td>
              </tr>
              <tr>
                <td>
                  <strong>Materiales y Recambios Utilizados</strong><br/>
                  <small>${job.invoice_materials || 'Ninguno / Incluido en el precio'}</small>
                </td>
                <td>-</td>
                <td style="text-align: right;">Incluidos</td>
              </tr>
              <tr>
                <td colspan="2" style="text-align: right; padding-top: 15px;"><strong>Base Imponible:</strong></td>
                <td style="text-align: right; padding-top: 15px;">${(job.invoice_price / 1.21).toFixed(2)} €</td>
              </tr>
              <tr>
                <td colspan="2" style="text-align: right;"><strong>IVA (21%):</strong></td>
                <td style="text-align: right;">${(job.invoice_price - (job.invoice_price / 1.21)).toFixed(2)} €</td>
              </tr>
              <tr class="total-row">
                <td colspan="2">TOTAL FACTURA (I.V.A. Incluido)</td>
                <td style="text-align: right;">${Number(job.invoice_price).toFixed(2)} €</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            Gracias por confiar en ServiHogar Jaén. Para cualquier duda, contáctenos en soporte@servihogar.com.<br/>
            Documento de validez legal generado digitalmente por ServiHogar App.
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}
