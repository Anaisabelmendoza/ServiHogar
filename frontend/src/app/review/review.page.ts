import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-review',
  templateUrl: './review.page.html',
  styleUrls: ['./review.page.scss'],
  standalone: false,
})
export class ReviewPage implements OnInit {
  profName: string = '';
  profAvatar: string = '';
  selectedRating: number = 5;
  commentText: string = '';
  imageError: boolean = false;
  requestId: number | null = null;

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private http: HttpClient,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['profName']) this.profName = params['profName'];
      if (params['profAvatar']) this.profAvatar = params['profAvatar'];
      if (params['requestId']) this.requestId = parseInt(params['requestId'], 10);
    });
  }

  setRating(rating: number) {
    this.selectedRating = rating;
  }

  handleImageError(event: any) {
    this.imageError = true;
  }

  async submitReview() {
    if (this.selectedRating === 0) {
      const toast = await this.toastController.create({
        message: 'Por favor, selecciona una valoración con estrellas.',
        duration: 2000,
        color: 'warning',
        position: 'bottom'
      });
      await toast.present();
      return;
    }

    console.log('Submitting client review to backend:', {
      requestId: this.requestId,
      rating: this.selectedRating,
      comment: this.commentText
    });

    const token = localStorage.getItem('token');
    if (token && this.requestId) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      try {
        await this.http.post(`${environment.apiUrl}/api/service-requests/${this.requestId}/review`, {
          rating: this.selectedRating,
          comment: this.commentText
        }, { headers }).toPromise();

        const toast = await this.toastController.create({
          message: '¡Muchas gracias por valorar al profesional!',
          duration: 2500,
          color: 'success',
          position: 'bottom'
        });
        await toast.present();
      } catch (err) {
        console.error('Error al guardar la reseña en Aiven:', err);
        const toast = await this.toastController.create({
          message: 'Error al enviar la valoración al servidor.',
          duration: 2500,
          color: 'danger',
          position: 'bottom'
        });
        await toast.present();
      }
    }

    // Volvemos a home al terminar el flujo
    this.router.navigate(['/home']);
  }
}
