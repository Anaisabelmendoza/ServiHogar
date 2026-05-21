import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-worker-review',
  templateUrl: './worker-review.page.html',
  styleUrls: ['./worker-review.page.scss'],
  standalone: false,
})
export class WorkerReviewPage implements OnInit {
  clientName: string = 'Nombre cliente';
  clientAvatar: string = '';
  rating: number = 5;
  requestId: number = 0;

  // Nuevos campos de Factura e Informe
  worker_report: string = '';
  invoice_base: number | null = null;
  invoice_hours: number | null = null;
  invoice_materials: string = '';

  get ivaAmount(): number {
    return this.invoice_base ? this.invoice_base * 0.21 : 0;
  }

  get invoice_total(): number {
    return this.invoice_base ? this.invoice_base + this.ivaAmount : 0;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastController: ToastController,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.clientName = params['clientName'] || 'Nombre cliente';
      this.clientAvatar = params['avatar'] || '';
      this.requestId = Number(params['id']) || 0;
    });
  }

  setRating(val: number) {
    this.rating = val;
  }

  async submitReview() {
    if (!this.invoice_base || !this.worker_report) {
      const warningToast = await this.toastController.create({
        message: 'Por favor, rellena el informe de trabajo y la base imponible.',
        duration: 3000,
        color: 'warning',
        position: 'bottom'
      });
      await warningToast.present();
      return;
    }

    console.log('Finalizando servicio y guardando factura en Aiven:', {
      requestId: this.requestId,
      status: 'finalizado',
      worker_rating: this.rating,
      worker_report: this.worker_report,
      invoice_price: this.invoice_total,
      invoice_hours: this.invoice_hours,
      invoice_materials: this.invoice_materials
    });

    const token = localStorage.getItem('token');
    if (token && this.requestId) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      try {
        // Enviar todos los datos de informe, factura y valoración en la misma petición
        await this.http.post(`${environment.apiUrl}/api/worker/requests/${this.requestId}/status`, {
          status: 'finalizado',
          worker_rating: this.rating,
          worker_report: this.worker_report,
          invoice_price: this.invoice_total,
          invoice_hours: this.invoice_hours,
          invoice_materials: this.invoice_materials
        }, { headers }).toPromise();
        
        console.log('Servicio finalizado y facturado con éxito en Aiven');
      } catch (err) {
        console.error('Error al actualizar el servicio en backend:', err);
        const errToast = await this.toastController.create({
          message: 'Error al enviar al servidor. Se guardará localmente.',
          duration: 3000,
          color: 'danger',
          position: 'bottom'
        });
        await errToast.present();
      }
    }

    // Persistencia local de respaldo
    const reviews = JSON.parse(localStorage.getItem('clientReviews') || '[]');
    reviews.push({
      requestId: this.requestId,
      clientName: this.clientName,
      status: 'finalizado',
      worker_report: this.worker_report,
      invoice_price: this.invoice_total,
      invoice_hours: this.invoice_hours,
      invoice_materials: this.invoice_materials,
      date: new Date().toLocaleDateString()
    });
    localStorage.setItem('clientReviews', JSON.stringify(reviews));

    const toast = await this.toastController.create({
      message: '¡Servicio finalizado e informe de factura generado!',
      duration: 2500,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();

    this.router.navigate(['/worker-home']);
  }
}
