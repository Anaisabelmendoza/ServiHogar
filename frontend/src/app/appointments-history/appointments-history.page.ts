import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AlertController } from '@ionic/angular';

interface Appointment {
  id: number;
  title: string;
  date: string;
  workerName: string;
  avatar: string;
  worker_report: string;
  invoice_price: number;
  invoice_materials: string;
  invoice_hours: number;
  worker_phone?: string;
  status: string;
  workerId?: number;
  workerRating?: number;
  appointmentType?: string;
  appointmentDate?: string;
}

@Component({
  selector: 'app-appointments-history',
  templateUrl: './appointments-history.page.html',
  styleUrls: ['./appointments-history.page.scss'],
  standalone: false,
})
export class AppointmentsHistoryPage implements OnInit {
  appointments: Appointment[] = [];
  isLoading: boolean = true;
  activeTab: string = 'citas';
  
  // Modal de Calendario
  isEditCalendarOpen: boolean = false;
  selectedDateTime: string | null = null;
  selectedAppointment: Appointment | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadHistory();
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  get activeAppointments(): Appointment[] {
    return this.appointments.filter(apt => apt.status === 'pendiente' || apt.status === 'en_progreso' || apt.status === 'aceptado');
  }

  get historyAppointments(): Appointment[] {
    return this.appointments.filter(apt => apt.status === 'finalizado' || apt.status === 'cancelado');
  }

  formatDateTime(isoString: string): string {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) {
        return isoString;
      }
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

  loadHistory() {
    this.isLoading = true;
    const token = localStorage.getItem('token');
    if (!token) {
      this.appointments = [];
      this.isLoading = false;
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get(`${environment.apiUrl}/api/client/history`, { headers }).subscribe({
      next: (res: any) => {
        if (res.status === 'success' && res.data) {
          this.appointments = res.data.map((h: any) => ({
            id: h.id,
            title: h.description || 'Servicio Técnico',
            date: h.appointment_type === 'programar' && h.appointment_date 
              ? this.formatDateTime(h.appointment_date) 
              : new Date(h.created_at).toLocaleDateString(),
            workerName: h.trabajador ? h.trabajador.name + (h.trabajador.apellidos ? ' ' + h.trabajador.apellidos : '') : 'Pendiente de asignación',
            avatar: h.trabajador?.avatarUrl || `https://ui-avatars.com/api/?name=${h.trabajador?.name || 'P'}&background=random`,
            worker_report: h.worker_report || '',
            invoice_price: Number(h.invoice_price) || 0,
            invoice_materials: h.invoice_materials || '',
            invoice_hours: Number(h.invoice_hours) || 0,
            worker_phone: h.trabajador?.telefono || '',
            status: h.status || 'pendiente',
            workerId: h.trabajador_id || null,
            workerRating: h.trabajador ? (h.trabajador.average_rating !== undefined ? h.trabajador.average_rating : 5) : 5,
            appointmentType: h.appointment_type,
            appointmentDate: h.appointment_date
          }));
        } else {
          this.appointments = [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar historial del cliente:', err);
        this.appointments = [];
        this.isLoading = false;
      }
    });
  }

  goToTracking(apt: Appointment) {
    if (!apt.workerId) return;
    this.router.navigate(['/service-tracking'], {
      queryParams: {
        profId: apt.workerId,
        profName: apt.workerName,
        profAvatar: apt.avatar,
        profRating: apt.workerRating || 5,
        profPhone: apt.worker_phone,
        requestId: apt.id
      }
    });
  }

  async cancelPendingRequest(apt: Appointment) {
    const alert = await this.alertController.create({
      header: 'Confirmar cancelación',
      message: '¿Estás seguro de que deseas cancelar esta cita programada? Podrás elegir a otro profesional.',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Sí, cancelar',
          handler: () => {
            this.executeCancellation(apt);
          }
        }
      ]
    });

    await alert.present();
  }

  private executeCancellation(apt: Appointment) {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.post(`${environment.apiUrl}/api/worker/requests/${apt.id}/status`, { status: 'cancelado' }, { headers }).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          // Recargar el historial
          this.loadHistory();
        }
      },
      error: (err) => {
        console.error('Error al cancelar la cita:', err);
      }
    });
  }

  openEditCalendar(apt: Appointment) {
    this.selectedAppointment = apt;
    this.selectedDateTime = apt.appointmentDate || new Date().toISOString();
    this.isEditCalendarOpen = true;
  }

  closeEditCalendar() {
    this.isEditCalendarOpen = false;
    this.selectedAppointment = null;
    this.selectedDateTime = null;
  }

  confirmDateChange() {
    if (!this.selectedAppointment || !this.selectedDateTime) return;
    
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const payload = {
      appointment_date: this.selectedDateTime
    };

    this.http.post(`${environment.apiUrl}/api/service-requests/${this.selectedAppointment.id}/update-date`, payload, { headers }).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.closeEditCalendar();
          this.loadHistory();
        }
      },
      error: (err) => {
        console.error('Error al actualizar la fecha de la cita:', err);
      }
    });
  }

  printInvoice(job: Appointment) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const today = new Date().toLocaleDateString();
    const userStr = localStorage.getItem('user');
    const clientName = userStr ? JSON.parse(userStr).name : 'Cliente de ServiHogar';

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
              <div><strong>Profesional:</strong> ${job.workerName}</div>
              <div><strong>Teléfono:</strong> ${job.worker_phone || 'No especificado'}</div>
              <div>ServiHogar Network</div>
            </div>
            <div>
              <div class="section-title">CLIENTE</div>
              <div><strong>Nombre:</strong> ${clientName}</div>
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
                  <strong>${job.title}</strong><br/>
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
