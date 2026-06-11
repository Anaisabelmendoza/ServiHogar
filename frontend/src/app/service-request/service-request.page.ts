import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-service-request',
  templateUrl: './service-request.page.html',
  styleUrls: ['./service-request.page.scss'],
  standalone: false,
})
export class ServiceRequestPage implements OnInit {
  appointmentType: 'programar' | 'urgente' | null = null;
  
  isCalendarOpen: boolean = false;
  selectedDateTime: string | null = null;
  confirmedDateTime: string | null = null;
  serviceId: string | null = null;
  clientAddress: string = '';

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.serviceId = this.route.snapshot.queryParams['service'] || null;
    
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const parts = [];
        if (user.domicilio) parts.push(user.domicilio);
        if (user.codigo_postal) parts.push(user.codigo_postal);
        if (user.ciudad) parts.push(user.ciudad);
        if (user.provincia) parts.push(user.provincia);
        
        this.clientAddress = parts.join(', ');
      } catch (e) {
        console.error(e);
      }
    }
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  goToAppointments() {
    this.router.navigate(['/appointments-history']);
  }

  setAppointmentType(type: 'programar' | 'urgente') {
    this.appointmentType = type;
    if (type === 'programar') {
      this.selectedDateTime = this.confirmedDateTime || new Date().toISOString();
      this.isCalendarOpen = true;
    } else {
      this.isCalendarOpen = false;
    }
  }

  closeCalendar() {
    this.isCalendarOpen = false;
    // If they closed without confirming, maybe revert selection if there's no confirmed date
    if (!this.confirmedDateTime && this.appointmentType === 'programar') {
      this.appointmentType = null;
    }
  }

  confirmCalendar() {
    this.confirmedDateTime = this.selectedDateTime || new Date().toISOString();
    this.isCalendarOpen = false;
  }

  get formattedDate(): string {
    if (!this.confirmedDateTime) return '';
    const d = new Date(this.confirmedDateTime);
    return `${d.getDate().toString().padStart(2, '0')} / ${(d.getMonth() + 1).toString().padStart(2, '0')} / ${d.getFullYear()}`;
  }

  get formattedTime(): string {
    if (!this.confirmedDateTime) return '';
    const d = new Date(this.confirmedDateTime);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }

  nextStep() {
    console.log('Next step clicked with type:', this.appointmentType);
    if (!this.appointmentType) {
      console.log('Please select an appointment type first');
      return;
    }
    
    // Si es programar y no ha elegido fecha, podríamos avisar
    if (this.appointmentType === 'programar' && !this.confirmedDateTime) {
      console.log('Por favor, selecciona una fecha y hora');
      return;
    }

    // Navigate to next screen
    this.router.navigate(['/service-description'], { 
      queryParams: { 
        service: this.serviceId,
        type: this.appointmentType,
        datetime: this.confirmedDateTime,
        address: this.clientAddress
      } 
    });
  }
}
