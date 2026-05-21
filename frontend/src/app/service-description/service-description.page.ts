import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-service-description',
  templateUrl: './service-description.page.html',
  styleUrls: ['./service-description.page.scss'],
  standalone: false,
})
export class ServiceDescriptionPage implements OnInit {
  description: string = '';
  appointmentType: string | null = null;
  appointmentDateTime: string | null = null;
  serviceId: string | null = null;
  address: string | null = null;
  
  attachedFiles: { name: string, url: string, type: string }[] = [];

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['type']) {
        this.appointmentType = params['type'];
      }
      if (params['datetime']) {
        this.appointmentDateTime = params['datetime'];
      }
      if (params['service']) {
        this.serviceId = params['service'];
      }
      if (params['address']) {
        this.address = params['address'];
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
  
  triggerFileInput(inputId: string) {
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  handleFileSelect(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Create a fake URL for preview
        const url = URL.createObjectURL(file);
        this.attachedFiles.push({
          name: file.name,
          url: url,
          type: file.type.startsWith('video') ? 'video' : 'image'
        });
      }
    }
    // Reset input
    event.target.value = '';
  }
  
  removeFile(index: number) {
    this.attachedFiles.splice(index, 1);
  }

  submitRequest() {
    console.log('Service requested with description:', this.description);
    console.log('Appointment Type:', this.appointmentType);
    console.log('Appointment DateTime:', this.appointmentDateTime);
    console.log('Attached Files:', this.attachedFiles);
    
    // Navigate to professional selection
    this.router.navigate(['/professional-selection'], {
      queryParams: {
        service: this.serviceId,
        description: this.description,
        type: this.appointmentType,
        datetime: this.appointmentDateTime,
        address: this.address
      }
    });
  }
}
