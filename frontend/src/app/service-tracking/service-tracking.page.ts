import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-service-tracking',
  templateUrl: './service-tracking.page.html',
  styleUrls: ['./service-tracking.page.scss'],
  standalone: false,
})
export class ServiceTrackingPage implements OnInit {
  profId: number | null = null;
  profName: string = '';
  profAvatar: string = '';
  profRating: number = 0;
  profPhone: string = '';

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['profId']) this.profId = parseInt(params['profId'], 10);
      if (params['profName']) this.profName = params['profName'];
      if (params['profAvatar']) this.profAvatar = params['profAvatar'];
      if (params['profRating']) this.profRating = parseInt(params['profRating'], 10);
      if (params['profPhone']) this.profPhone = params['profPhone'];
    });
  }

  callProfessional() {
    const phone = this.profPhone || '600000011';
    window.location.href = `tel:${phone}`;
  }

  chatProfessional() {
    const phone = this.profPhone || '600000011';
    const msg = `Hola ${this.profName}, soy tu cliente de ServiHogar. ¿A qué hora estimas llegar aproximadamente?`;
    window.open(`https://wa.me/34${phone}?text=${encodeURIComponent(msg)}`, '_system');
  }

  finishJob() {
    console.log('Job finished successfully');
    this.router.navigate(['/review'], {
      queryParams: {
        profName: this.profName,
        profAvatar: this.profAvatar
      }
    });
  }

  isCancelModalOpen: boolean = false;

  cancelJob() {
    this.isCancelModalOpen = true;
  }

  confirmCancelJob() {
    this.isCancelModalOpen = false;
    this.router.navigate(['/home']);
  }

  dismissCancelModal() {
    this.isCancelModalOpen = false;
  }

  reportProblem() {
    console.log('Reporting problem');
    this.router.navigate(['/report-problem'], {
      queryParams: {
        profId: this.profId,
        profName: this.profName
      }
    });
  }

  scheduleAnother() {
    console.log('Scheduling another');
    this.router.navigate(['/home']);
  }
}
