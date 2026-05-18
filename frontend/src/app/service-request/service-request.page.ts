import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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

  constructor(private router: Router) { }

  ngOnInit() {
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  setAppointmentType(type: 'programar' | 'urgente') {
    this.appointmentType = type;
    if (type === 'programar') {
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
        type: this.appointmentType,
        datetime: this.confirmedDateTime
      } 
    });
  }
}
