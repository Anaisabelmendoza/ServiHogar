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
  rating: number = 0;
  comment: string = '';
  requestId: number = 0;

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
      this.requestId = params['id'] || 0;
    });
  }

  setRating(val: number) {
    this.rating = val;
  }

  async submitReview() {
    console.log('Enviando reseña para cliente a Aiven:', {
      requestId: this.requestId,
      rating: this.rating,
      comment: this.comment
    });

    const token = localStorage.getItem('token');
    if (token && this.requestId) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      // 1. Guardar la reseña en Aiven
      this.http.post(`${environment.apiUrl}/api/worker/requests/${this.requestId}/review`, {
        rating: this.rating,
        comment: this.comment
      }, { headers }).subscribe({
        next: (res) => {
          console.log('Reseña guardada con éxito en Aiven:', res);
        },
        error: (err) => {
          console.error('Error al guardar reseña en Aiven:', err);
        }
      });

      // 2. Finalizar el estado del trabajo en Aiven
      this.http.post(`${environment.apiUrl}/api/worker/requests/${this.requestId}/status`, {
        status: 'finalizado'
      }, { headers }).subscribe({
        next: (res) => {
          console.log('Estado actualizado a finalizado en Aiven:', res);
        },
        error: (err) => {
          console.error('Error al finalizar estado en Aiven:', err);
        }
      });
    }

    // Fallback de persistencia local por si acaso
    const reviews = JSON.parse(localStorage.getItem('clientReviews') || '[]');
    reviews.push({
      requestId: this.requestId,
      clientName: this.clientName,
      rating: this.rating,
      comment: this.comment,
      date: new Date().toLocaleDateString()
    });
    localStorage.setItem('clientReviews', JSON.stringify(reviews));

    const toast = await this.toastController.create({
      message: '¡Valoración enviada con éxito!',
      duration: 2000,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();

    this.router.navigate(['/worker-home']);
  }
}
