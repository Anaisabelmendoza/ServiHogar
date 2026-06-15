import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ToastController } from '@ionic/angular';

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

  isLocationModalOpen: boolean = false;
  locationQuery: string = '';
  locationResults: any[] = [];
  isLoadingLocations: boolean = false;
  searchTimeout: any;

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private http: HttpClient,
    private toastController: ToastController
  ) { }

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

  openLocationModal() {
    this.isLocationModalOpen = true;
    this.locationQuery = '';
    this.locationResults = [];
  }

  closeLocationModal() {
    this.isLocationModalOpen = false;
  }

  onSearchLocation(event: any) {
    const query = event.detail.value;
    if (!query || query.length < 3) {
      this.locationResults = [];
      return;
    }

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.isLoadingLocations = true;
    
    // Debounce de 500ms para no saturar la API
    this.searchTimeout = setTimeout(() => {
      // Usar Nominatim OpenStreetMap API
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&countrycodes=es&limit=5`;
      this.http.get(url).subscribe({
        next: (results: any) => {
          this.locationResults = results;
          this.isLoadingLocations = false;
        },
        error: (err) => {
          console.error('Error fetching locations', err);
          this.isLoadingLocations = false;
        }
      });
    }, 500);
  }

  selectLocation(result: any) {
    if (result.address) {
      const road = result.address.road || result.name || '';
      const houseNumber = result.address.house_number ? ' ' + result.address.house_number : '';
      const city = result.address.city || result.address.town || result.address.village || '';
      const postcode = result.address.postcode || '';
      const province = result.address.province || '';
      
      const parts = [road + houseNumber, city, province, postcode].filter(p => p.trim() !== '');
      this.clientAddress = parts.join(', ');

      // Guardar permanentemente en el perfil del cliente
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (userStr && token) {
        try {
          const user = JSON.parse(userStr);
          const payload = {
            name: user.name || 'Usuario',
            apellidos: user.apellidos || null,
            telefono: user.telefono || null,
            email: user.email || 'usuario@servihogar.com',
            profesion: user.profesion || null,
            avatarUrl: user.avatarUrl || null,
            domicilio: road + houseNumber,
            ciudad: city,
            provincia: province,
            codigo_postal: postcode
          };

          const headers = { 'Authorization': `Bearer ${token}` };
          this.http.post(`${environment.apiUrl}/api/user/profile`, payload, { headers }).subscribe({
            next: async (res: any) => {
              if (res.status === 'success' && res.user) {
                localStorage.setItem('user', JSON.stringify(res.user));
                const toast = await this.toastController.create({
                  message: 'Ubicación modificada',
                  duration: 2000,
                  color: 'success',
                  icon: 'checkmark-circle'
                });
                await toast.present();
              }
            },
            error: (err) => console.error('Error al actualizar el perfil con la nueva dirección:', err)
          });
        } catch (e) {
          console.error('Error procesando usuario:', e);
        }
      }
    } else {
      this.clientAddress = result.display_name;
    }
    this.closeLocationModal();
  }

  clearAddress() {
    this.clientAddress = '';
  }

  async saveManualAddress() {
    if (!this.clientAddress || this.clientAddress.trim() === '') {
      const toast = await this.toastController.create({
        message: 'Por favor, escribe una dirección válida.',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (userStr && token) {
      try {
        const user = JSON.parse(userStr);
        const payload = {
          name: user.name || 'Usuario',
          apellidos: user.apellidos || null,
          telefono: user.telefono || null,
          email: user.email || 'usuario@servihogar.com',
          profesion: user.profesion || null,
          avatarUrl: user.avatarUrl || null,
          domicilio: this.clientAddress,
          ciudad: null,
          provincia: null,
          codigo_postal: null
        };

        const headers = { 'Authorization': `Bearer ${token}` };
        this.http.post(`${environment.apiUrl}/api/user/profile`, payload, { headers }).subscribe({
          next: async (res: any) => {
            if (res.status === 'success' && res.user) {
              localStorage.setItem('user', JSON.stringify(res.user));
              const toast = await this.toastController.create({
                message: 'Ubicación modificada',
                duration: 2000,
                color: 'success',
                icon: 'checkmark-circle'
              });
              await toast.present();
            }
          },
          error: async (err) => {
            console.error('Error al guardar dirección manual:', err);
            const toast = await this.toastController.create({
              message: 'Error al guardar la dirección',
              duration: 2000,
              color: 'danger'
            });
            await toast.present();
          }
        });
      } catch (e) {
        console.error('Error procesando usuario:', e);
      }
    }
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

    // Guardar permanentemente en el perfil del cliente la dirección escrita manualmente
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (userStr && token && this.clientAddress) {
      try {
        const user = JSON.parse(userStr);
        const payload = {
          name: user.name || 'Usuario',
          apellidos: user.apellidos || null,
          telefono: user.telefono || null,
          email: user.email || 'usuario@servihogar.com',
          profesion: user.profesion || null,
          avatarUrl: user.avatarUrl || null,
          domicilio: this.clientAddress, // Usar la dirección completa escrita
          ciudad: null,
          provincia: null,
          codigo_postal: null
        };

        const headers = { 'Authorization': `Bearer ${token}` };
        this.http.post(`${environment.apiUrl}/api/user/profile`, payload, { headers }).subscribe({
          next: (res: any) => {
            if (res.status === 'success' && res.user) {
              localStorage.setItem('user', JSON.stringify(res.user));
            }
          },
          error: (err) => console.error('Error al actualizar el perfil al pulsar siguiente:', err)
        });
      } catch (e) {
        console.error('Error procesando usuario:', e);
      }
    }
    
    console.log('Navigating to service description with address:', this.clientAddress);

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
