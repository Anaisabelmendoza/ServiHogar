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
        
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const base64Image = e.target.result;
          this.attachedFiles.push({
            name: file.name,
            url: base64Image, // Use base64 string as URL for preview
            type: file.type.startsWith('video') ? 'video' : 'image'
          });
          
          // Guardar imagen en localStorage temporalmente para enviarla luego
          localStorage.setItem('temp_request_image', base64Image);
        };
        reader.readAsDataURL(file);
      }
    }
    // Reset input
    event.target.value = '';
  }
  
  removeFile(index: number) {
    this.attachedFiles.splice(index, 1);
    localStorage.removeItem('temp_request_image');
  }

  submitRequest() {
    console.log('Service requested with description:', this.description);
    console.log('Navigating to professional selection with address:', this.address);
    
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
