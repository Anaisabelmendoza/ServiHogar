import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-professional-selection',
  templateUrl: './professional-selection.page.html',
  styleUrls: ['./professional-selection.page.scss'],
  standalone: false,
})
export class ProfessionalSelectionPage implements OnInit {
  
  // Dummy data para simular la base de datos de profesionales
  professionals = [
    {
      id: 1,
      name: 'Nombre trabajador 1',
      rating: 0,
      avatar: 'https://i.pravatar.cc/150?img=11',
      phone: '600000011'
    },
    {
      id: 2,
      name: 'Nombre trabajador 2',
      rating: 0,
      avatar: 'https://i.pravatar.cc/150?img=12',
      phone: '600000012'
    },
    {
      id: 3,
      name: 'Nombre trabajador 3',
      rating: 0,
      avatar: 'https://i.pravatar.cc/150?img=13',
      phone: '600000013'
    }
  ];

  selectedProfessionalId: number | null = null;
  appointmentType: string | null = null;
  appointmentDateTime: string | null = null;

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    // Recibir parámetros de la página anterior
    this.route.queryParams.subscribe(params => {
      if (params['type']) {
        this.appointmentType = params['type'];
      }
      if (params['datetime']) {
        this.appointmentDateTime = params['datetime'];
      }
    });
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
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
    if (this.selectedProfessionalId) {
      console.log('Professional selected:', this.selectedProfessionalId);
      console.log('Finalizing request with type:', this.appointmentType, 'and date:', this.appointmentDateTime);
      
      const selectedProf = this.professionals.find(p => p.id === this.selectedProfessionalId);
      
      // Navigate to tracking screen
      this.router.navigate(['/service-tracking'], {
        queryParams: {
          profId: this.selectedProfessionalId,
          profName: selectedProf?.name,
          profAvatar: selectedProf?.avatar,
          profRating: selectedProf?.rating,
          profPhone: selectedProf?.phone
        }
      });
    }
  }
}
