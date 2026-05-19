import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

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

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadHistory();
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
            date: new Date(h.updated_at).toLocaleDateString(),
            workerName: h.trabajador ? h.trabajador.name + (h.trabajador.apellidos ? ' ' + h.trabajador.apellidos : '') : 'Profesional ServiHogar',
            avatar: h.trabajador?.avatarUrl || `https://ui-avatars.com/api/?name=${h.trabajador?.name || 'P'}&background=random`,
            worker_report: h.worker_report || '',
            invoice_price: Number(h.invoice_price) || 0,
            invoice_materials: h.invoice_materials || '',
            invoice_hours: Number(h.invoice_hours) || 0,
            worker_phone: h.trabajador?.telefono || ''
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
                <td style="text-align: right;">${job.invoice_price.toFixed(2)} €</td>
              </tr>
              <tr>
                <td>
                  <strong>Materiales y Recambios Utilizados</strong><br/>
                  <small>${job.invoice_materials || 'Ninguno / Incluido en el precio'}</small>
                </td>
                <td>-</td>
                <td style="text-align: right;">Incluidos</td>
              </tr>
              <tr class="total-row">
                <td colspan="2">TOTAL FACTURA (I.V.A. Incluido)</td>
                <td style="text-align: right;">${job.invoice_price.toFixed(2)} €</td>
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
