import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-professional-selection',
  templateUrl: './professional-selection.page.html',
  styleUrls: ['./professional-selection.page.scss'],
  standalone: false,
})
export class ProfessionalSelectionPage implements OnInit {
  
  professionals: any[] = [];
  selectedProfessionalId: number | null = null;
  appointmentType: string | null = null;
  appointmentDateTime: string | null = null;
  serviceId: string | null = null;
  description: string | null = null;
  address: string | null = null;
  isSubmitting = false;
  isLoading = true;

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private http: HttpClient
  ) { }

  ngOnInit() {
    // Recibir parámetros de la página anterior
    this.route.queryParams.subscribe(params => {
      this.appointmentType = params['type'] || null;
      this.appointmentDateTime = params['datetime'] || null;
      this.serviceId = params['service'] || null;
      this.description = params['description'] || '';
      this.address = params['address'] || null;
      
      this.loadProfessionals();
    });
  }

  loadProfessionals() {
    this.isLoading = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    let url = `${environment.apiUrl}/api/workers`;
    if (this.serviceId) {
      url += `?profesion=${this.serviceId}`;
    }

    this.http.get(url, { headers }).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.professionals = res.data.map((w: any) => ({
            id: w.id,
            name: w.name + (w.apellidos ? ' ' + w.apellidos : ''),
            rating: 5,
            avatar: w.avatarUrl || `https://ui-avatars.com/api/?name=${w.name}&background=random`,
            phone: w.telefono
          }));
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching professionals:', err);
        this.isLoading = false;
        // Optionally load dummy data for UI testing if backend fails
      }
    });
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  goToAppointments() {
    this.router.navigate(['/appointments-history']);
  }

  selectProfessional(id: number) {
    this.selectedProfessionalId = id;
  }

  callProfessional(prof: any) {
    const phone = prof.phone || '600000011';
    window.location.href = `tel:${phone}`;
  }

  chatProfessional(prof: any) {
    const phone = prof.phone || '600000011';
    const msg = `Hola ${prof.name}, soy cliente de ServiHogar. Me gustaría hablar contigo sobre el servicio solicitado.`;
    window.open(`https://wa.me/34${phone}?text=${encodeURIComponent(msg)}`, '_system');
  }

  confirmSelection() {
    if (this.selectedProfessionalId && !this.isSubmitting) {
      this.isSubmitting = true;
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      
      const imageBase64 = localStorage.getItem('temp_request_image');
      const payload = {
        description: this.description || 'Sin descripción',
        appointment_type: this.appointmentType || 'urgente',
        appointment_date: this.appointmentDateTime,
        trabajador_id: this.selectedProfessionalId,
        address: this.address,
        image_base64: imageBase64
      };
      
      this.http.post(`${environment.apiUrl}/api/service-requests`, payload, { headers }).subscribe({
        next: (res: any) => {
          this.isSubmitting = false;
          localStorage.removeItem('temp_request_image');
          const selectedProf = this.professionals.find(p => p.id === this.selectedProfessionalId);
          // Navigate to tracking screen
          this.router.navigate(['/service-tracking'], {
            queryParams: {
              profId: this.selectedProfessionalId,
              profName: selectedProf?.name,
              profAvatar: selectedProf?.avatar,
              profRating: selectedProf?.rating,
              profPhone: selectedProf?.phone,
              requestId: res.data.id
            }
          });
        },
        error: (err) => {
          console.error('Error creating request:', err);
          this.isSubmitting = false;
          alert('Hubo un error al crear la solicitud.');
        }
      });
    }
  }
}
